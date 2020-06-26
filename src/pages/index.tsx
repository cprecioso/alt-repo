import React from "react"
import url from "url"
import { Query as APIQuery } from "./api/source"

export default () => {
  const [state, setState] = React.useState<APIQuery>({
    type: "gh-releases",
    source: "pwn20wndstuff/Undecimus",
    bundleId: "science.xnu.undecimus",
  })

  return (
    <>
      <p>
        <label>
          GitHub Repo:{" "}
          <input
            type="text"
            onChange={(e) =>
              setState((state) => ({ ...state, source: e.currentTarget.value }))
            }
            value={state.source}
          />
        </label>
        <br />
        <label>
          Bundle ID:{" "}
          <input
            type="text"
            onChange={(e) =>
              setState((state) => ({
                ...state,
                bundleId: e.currentTarget.validationMessage,
              }))
            }
            value={state.bundleId}
          />
        </label>
      </p>
      {state.source && state.bundleId ? (
        <p>
          <a
            href={url.format({
              pathname: "/api/source",
              query: { ...state },
            })}
          >
            Get AltStore Repo for {state.source}
          </a>
        </p>
      ) : null}
    </>
  )
}
