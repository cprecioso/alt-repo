import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import url from "url"
import { bundleIdFromIPA } from "../../api/parse-ipa"
import { Query as APIQuery } from "../api/ghr"

type Params = { type: string; params: string[] }
type Props = { apiQuery?: APIQuery }

export default (({ apiQuery }) =>
  apiQuery ? (
    <p>
      <a
        href={url.format({
          pathname: "/api/ghr",
          query: apiQuery as any,
        })}
        onClick={(e) => e.preventDefault()}
      >
        Long tap in this link, copy the URL and paste into AltStore.
      </a>
    </p>
  ) : (
    <p>Loading...</p>
  )) as NextPage<Props>

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  if (params?.type !== "ghr") throw new Error("No type")

  const repo = params.params.join("/")
  const bundleId = await bundleIdFromIPA(repo)

  if (!bundleId) throw new Error("Can't find bundle id")

  return { props: { apiQuery: { repo, bundleId } } }
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: true,
})
