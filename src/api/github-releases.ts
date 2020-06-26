import { GraphQLClient } from "graphql-request"

const gql = String.raw.bind(String)

const TOKEN = process.env.GH_API_TOKEN

const client = new GraphQLClient("https://api.github.com/graphql", {
  headers: { Authorization: `Bearer ${TOKEN}` },
})

export const fetchGitHubReleasesData = async (repoUrl: string) => {
  const [repoOwner, repoName] = repoUrl.split("/").slice(-2)

  const responseData = await client.request<{
    repository: {
      name: string
      owner: { login: string; name: string }
      description: string
      releases: {
        nodes: ({
          name: string
          createdAt: string
          tagName: string
          description: string
          releaseAssets: {
            nodes: ({
              name: string
              downloadUrl: string
              size: number
            } | null)[]
          }
        } | null)[]
      }
    } | null
  }>(
    gql`
      query FetchRepoReleasesData($repoOwner: String!, $repoName: String!) {
        repository(name: $repoName, owner: $repoOwner) {
          description
          releases(last: 5) {
            nodes {
              name
              createdAt
              description
              tagName
              releaseAssets(first: 50) {
                nodes {
                  name
                  downloadUrl
                  size
                }
              }
            }
          }
          name
          owner {
            login
            ... on User {
              name
            }
            ... on Organization {
              name
            }
          }
        }
      }
    `,
    { repoOwner, repoName }
  )

  return responseData.repository
}
