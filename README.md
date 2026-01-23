# website

> This repository contains all code relevant to my personal website: http://daniel.heene.io which was initially based on
> official [Payload Website Template](https://github.com/payloadcms/payload/blob/main/templates/website).

## development

**prerequisites**:

- I used the Vercel Blob Storage to store media files. Either you also use this and provide the token as
  `BLOB_READ_WRITE_TOKEN` or you replace the storage plugin with another adapter.

- I used the Vercel Postgres integration as database, but any other PostgresSQL database should also work. Simply enter
  the connection string as `DATABASE_URL`

**start local development**:

```
cp .env.example .env.local // adjust variables
pnpm install
pnpm run dev:app 
```

**seed some data**:

During the development process i put part of my portfolio data into a seed function to be able to start test
environments faster. As a logged in user you can call `/api/seed` and import this data.

**ATTENTION**: this route should be deactivated if there are more users planned

-----

### notable features:

- **image metadata**: when uploading images, their average brightness, the most prominent colors as well as a BlurHash
  are calculated
- **embedded svgs**: to be able to adapt the logos of the previous clients to the website theme, the svgs are sent to an
  internal APi to sanitize them and adapt their properties

### planned features:

- **Blog**: In the future I would like to use this site as a blog as well, which is why the backend has already been
  adapted to this in places
- **Storybook**: Some components already have matching stories, but currently no storybook is deployed, because I would
  have to detach the deployment from vercel.
- **Testing**: To implement tests, it would also have been necessary to detach the deployment from Vercel. But I haven't
  had the time to do this yet

---

#### Legacy Code 

The following code of my previous websites is no longer maintained, but a dump of their code bases can still be found under the following tags: [website-v2](https://github.com/danielheene/website/tree/homepage-v2) | [website-v1](https://github.com/danielheene/website/tree/homepage-v1). 
