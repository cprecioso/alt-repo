import { NextApiHandler } from "next"
import url from "url"
import { App, Source } from "../../altstore-source"
import { fetchGitHubReleasesData } from "../../api/github-releases"
import { colorFromString } from "../../util"
import { Query as IconQuery } from "./ghr-icon"

export interface Query {
  repo: string
  bundleId: string
}

const notNull = <T>(v: T | null): v is T => !!v

export default (async (req, res) => {
  const query = (req.query as unknown) as Query
  const repo = await fetchGitHubReleasesData(query.repo)

  if (!repo) {
    res.writeHead(404, "Not found")
    res.end()
    return
  }

  return res.json({
    name: `${repo.name} Repo`,
    identifier: `app.vercel.altrepo.ghr.${repo.owner.login}.${repo.name}`,
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
          iconURL: url.format({
            pathname: "/api/ghr-icon",
            query: ({ repo: query.repo } as IconQuery) as any,
          }),
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
