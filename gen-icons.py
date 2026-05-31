#!/usr/bin/env python3
"""PWA用アイコン(192/512px)を標準ライブラリのみで生成する。
ダーク背景 + 青ダイヤ。maskable の安全領域(中央 ~80%)内に収める。
再生成: python3 gen-icons.py
"""
import zlib, struct


def make_png(size, path):
    cx = cy = size / 2
    r = size * 0.33  # ダイヤ半径
    bg = (10, 13, 18)
    fill = (77, 163, 255)
    edge = (207, 228, 255)
    border = max(2, size * 0.012)

    rows = bytearray()
    for y in range(size):
        rows.append(0)  # 各行の filter type = 0
        for x in range(size):
            d = abs(x - cx) + abs(y - cy)  # 回転正方形(ダイヤ)
            if d <= r:
                c = fill
            elif d <= r + border:
                c = edge
            else:
                c = bg
            rows += bytes(c)

    def chunk(typ, data):
        body = typ + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xffffffff)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # 8bit / RGB
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(bytes(rows), 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    print(f"{path}: {size}x{size}, {len(png)} bytes")


if __name__ == "__main__":
    make_png(192, "icon-192.png")
    make_png(512, "icon-512.png")
