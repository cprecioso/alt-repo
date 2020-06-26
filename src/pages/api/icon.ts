import { createCanvas } from "canvas"
import { NextApiHandler } from "next"
import stream from "stream"
import util from "util"
import { colorFromString } from "../../util"

const CANVAS_WIDTH = 512
const CANVAS_HEIGHT = 512

const pipeline = util.promisify(stream.pipeline)

export type Query = { name: string }

export default (async (req, res) => {
  const name = (req.query as Query).name ?? ""
  const color = colorFromString(name)
  const letter = name.slice(0, 1) || "?"

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = `#${color}`
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = "white"
  ctx.strokeStyle = "black"
  ctx.font = "bold 500px sans-serif"

  const dim = ctx.measureText(letter)
  const letterX = CANVAS_WIDTH / 2 - dim.width / 2
  const letterY =
    CANVAS_HEIGHT / 2 +
    (dim.actualBoundingBoxAscent - dim.actualBoundingBoxDescent) / 2

  ctx.strokeText(letter, letterX, letterY)
  ctx.fillText(letter, letterX, letterY)

  res.setHeader("Content-Type", "image/png")
  return pipeline(canvas.createPNGStream(), res)
}) as NextApiHandler
