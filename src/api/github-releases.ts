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
          releases(first: 1, orderBy: { field: CREATED_AT, direction: DESC }) {
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

export const fetchGitHubLastReleaseFile = async (repoUrl: string) => {
  const [repoOwner, repoName] = repoUrl.split("/").slice(-2)

  const responseData = await client.request<{
    repository: {
      releases: {
        nodes: ({
          releaseAssets: {
            nodes: ({
              name: string
              downloadUrl: string
            } | null)[]
          }
        } | null)[]
      }
    } | null
  }>(
    gql`
      query LastRelease($repoOwner: String!, $repoName: String!) {
        repository(name: $repoName, owner: $repoOwner) {
          releases(first: 1, orderBy: { field: CREATED_AT, direction: DESC }) {
            nodes {
              releaseAssets(first: 50) {
                nodes {
                  name
                  downloadUrl
                }
              }
            }
          }
        }
      }
    `,
    { repoOwner, repoName }
  )

  return responseData.repository
}
