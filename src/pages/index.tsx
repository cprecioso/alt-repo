import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"

export default () => {
  const router = useRouter()
  const [state, setState] = React.useState({ repo: "" })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        router.push("/[type]/[...params]", `/ghr/${state.repo}`)
      }}
    >
      <label>
        GitHub Repo:{" "}
        <input
          type="text"
          onChange={(e) => {
            const repo = e.currentTarget.value
            setState((state) => ({ ...state, repo }))
          }}
          value={state.repo}
        />
      </label>
      <Link href="/[type]/[...params]" as={`/ghr/${state.repo}`}>
        <a>Go</a>
      </Link>
    </form>
  )
}
