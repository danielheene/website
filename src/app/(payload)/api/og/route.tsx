import { ImageResponse } from 'next/og'
// App router includes @vercel/og.
// No need to install it.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ?title=<title>
    const hasTitle = searchParams.has('title')
    const hasDescription = searchParams.has('description')
    const hasImage = searchParams.has('image')
    const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : null
    const description = hasDescription ? searchParams.get('description') : null
    const image = hasImage ? searchParams.get('image') : null

    // const imageData = await fetch(image).then(async (res) => {
    //   const arrayBuffer = await res.arrayBuffer()
    //   return `data:${res.headers.get('content-type')};base64,${Buffer.from(arrayBuffer).toString('base64')}`
    // })
    //

    const img = new URL(`/_next/image`, request.url)
    img.searchParams.set('url', image)
    img.searchParams.set('w', '1200')
    img.searchParams.set('q', '85')

    console.log(img.toString())
    return new ImageResponse(
      (
        <div
          style={{
            backgroundImage: `url("${img.toString()}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '30px', color: '#fff'}}>{title}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
