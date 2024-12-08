interface Database {
    media: MediaTable
    site_url: SiteUrlTable
  }
  
  interface MediaTable {
    id: number
    name: string
    alias: string
    active: boolean
  }
  
  interface SiteUrlTable {
    id: number
    site: string
    url: string
    title: string
    time: Date
    media_id: number
  }
  
  export type { Database }