import bplist from "bplist-parser"
import getStream from "get-stream"
import got from "got"
import minimatch from "minimatch"
import { NextApiHandler } from "next"
import stream from "stream"
import unzipper, { Entry } from "unzipper"
import util from "util"
import { fetchGitHubLastReleaseFile } from "../../api/github-releases"

const pipeline = util.promisify(stream.pipeline)

export interface Query {
  repo: string
}

const notNull = <T>(v: T | null): v is T => !!v

export default (async (req, res) => {
  const die = () => {
    res.writeHead(404, "Not found")
    res.end()
  }

  const query = (req.query as unknown) as Query
  const repo = await fetchGitHubLastReleaseFile(query.repo)

  if (!repo) return die()

  const latestIpaUrl = repo.releases.nodes
    .filter(notNull)
    .flatMap((release) => release.releaseAssets.nodes)
    .filter(notNull)
    .find((asset) => asset.name.match(/\.ipa$/i))?.downloadUrl

  if (!latestIpaUrl) return die()
  const makeIpaStream = () => got.stream(latestIpaUrl)

  const infoPlistExtractor = unzipper.ParseOne(
    minimatch.makeRe("Payload/*.app/Info.plist")
  )
  pipeline(makeIpaStream(), infoPlistExtractor)

  const plistFile = await getStream.buffer(infoPlistExtractor)

  const plist = bplist.parseBuffer(plistFile)[0]
  const iconName =
    plist.CFBundleIcons?.CFBundlePrimaryIcon?.CFBundleIconName ?? "AppIcon"

  const imagePlistExtractor = unzipper.Parse({ forceStream: true })
  pipeline(makeIpaStream(), imagePlistExtractor)

  const imagePlistRe = minimatch.makeRe(`Payload/*.app/${iconName}*.png`)
  let selectedIcon: Buffer | null = null
  for await (const entry of imagePlistExtractor as AsyncIterable<Entry>) {
    try {
      if (!imagePlistRe.test(entry.path)) continue

      if ((entry.vars as any).uncompressedSize > (selectedIcon?.length ?? 0)) {
        console.log(entry.path)
        selectedIcon = await entry.buffer()
      }
    } finally {
      entry.autodrain()
    }
  }

  console.log(selectedIcon)
  if (!selectedIcon) return die()

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Cache-Control": "max-age=31536000, public",
  })
  return res.end(selectedIcon)
}) as NextApiHandler
