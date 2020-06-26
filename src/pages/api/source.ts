import { NextApiHandler } from "next"
import { App, Source } from "../../altstore-source"
import { fetchGitHubReleasesData } from "../../api/github-releases"
import { colorFromString } from "../../util"

export interface Query {
  type: "gh-releases"
  source: string
  bundleId: string
}

const notNull = <T>(v: T | null): v is T => !!v

export default (async (req, res) => {
  const query = (req.query as unknown) as Query
  const repo = await fetchGitHubReleasesData(query.source)

  if (!repo) {
    res.writeHead(404, "Not found")
    res.end()
    return
  }

  res.json({
    name: `${repo.name} Repo`,
    identifier: `sh.now.altrepo.${query.type}.${repo.owner.login}.${repo.name}`,
    apps: repo.releases.nodes
      .map((release) => {
        if (!release) return null

        const asset = release.releaseAssets.nodes.find((asset) =>
          asset?.name.match(/\.ipa$/i)
        )
        if (!asset) return null

        return {
          name: repo.name,
          bundleIdentifier: query.bundleId,
          developerName: repo.owner.name,
          subtitle: repo.description,
          version: release.tagName.replace(/^v(\d)/i, "$1"),
          versionDate: release.createdAt,
          versionDescription: release.name,
          downloadURL: asset.downloadUrl,
          localizedDescription: release.description,
          iconURL: undefined,
          tintColor: colorFromString(repo.name),
          size: asset.size,
          screenshotURLs: [],
        } as App
      })
      .filter(notNull),
    news: [],
    userInfo: {},
  } as Source)
}) as NextApiHandler<Source>
