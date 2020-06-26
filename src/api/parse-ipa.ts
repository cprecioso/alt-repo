import bplist from "bplist-parser"
import getStream from "get-stream"
import got from "got"
import minimatch from "minimatch"
import stream from "stream"
import unzipper from "unzipper"
import util from "util"
import { fetchGitHubLastReleaseFile } from "./github-releases"

const notNull = <T>(v: T | null): v is T => !!v
const pipeline = util.promisify(stream.pipeline)

export const bundleIdFromIPA = async (repo: string) => {
  const repoData = await fetchGitHubLastReleaseFile(repo)

  if (!repoData) return null

  const latestIpaUrl = repoData.releases.nodes
    .filter(notNull)
    .flatMap((release) => release.releaseAssets.nodes)
    .filter(notNull)
    .find((asset) => asset.name.match(/\.ipa$/i))?.downloadUrl

  if (!latestIpaUrl) return null
  const makeIpaStream = () => got.stream(latestIpaUrl)

  const infoPlistExtractor = unzipper.ParseOne(
    minimatch.makeRe("Payload/*.app/Info.plist")
  )
  pipeline(makeIpaStream(), infoPlistExtractor)

  const plistFile = await getStream.buffer(infoPlistExtractor)

  const plist = bplist.parseBuffer(plistFile)[0]
  const bundleId = plist.CFBundleIdentifier as string

  return bundleId || null
}
