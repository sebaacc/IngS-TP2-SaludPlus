import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count == 3 else {
  fputs("Usage: render-labels.swift OUTPUT_DIR SCENES_JSON\n", stderr)
  exit(2)
}

let outputDir = URL(fileURLWithPath: args[1], isDirectory: true)
let scenesData = Data(args[2].utf8)
guard let scenes = try JSONSerialization.jsonObject(with: scenesData) as? [[String: String]] else {
  fputs("Could not read scene labels.\n", stderr)
  exit(2)
}

let width = 1920
let height = 1080
for (index, scene) in scenes.enumerated() {
  let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width,
    pixelsHigh: height,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  )!
  let context = NSGraphicsContext(bitmapImageRep: bitmap)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  context.imageInterpolation = .high

  NSColor.clear.setFill()
  NSRect(x: 0, y: 0, width: width, height: height).fill()
  NSColor(calibratedRed: 16.0 / 255.0, green: 47.0 / 255.0, blue: 74.0 / 255.0, alpha: 0.92).setFill()
  NSRect(x: 0, y: 0, width: width, height: 150).fill()

  let titleStyle: [NSAttributedString.Key: Any] = [
    .font: NSFont.boldSystemFont(ofSize: 42),
    .foregroundColor: NSColor.white
  ]
  let subtitleStyle: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 26, weight: .medium),
    .foregroundColor: NSColor(calibratedRed: 211.0 / 255.0, green: 228.0 / 255.0, blue: 239.0 / 255.0, alpha: 1)
  ]
  (scene["title"]! as NSString).draw(at: NSPoint(x: 88, y: 87), withAttributes: titleStyle)
  (scene["subtitle"]! as NSString).draw(at: NSPoint(x: 88, y: 37), withAttributes: subtitleStyle)

  NSGraphicsContext.restoreGraphicsState()
  let output = outputDir.appendingPathComponent(String(format: "label-%02d.png", index))
  guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Could not render label \(index).\n", stderr)
    exit(1)
  }
  try pngData.write(to: output)
}
