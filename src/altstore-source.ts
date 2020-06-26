export interface Source {
  name: string
  identifier: string
  apps: App[]
  news: News[]
  userInfo: UserInfo
}

export interface App {
  name: string
  bundleIdentifier: string
  developerName: string
  subtitle: string
  version: string
  versionDate: string
  versionDescription: string
  downloadURL: string
  localizedDescription: string
  iconURL?: string
  tintColor: string
  size: number
  screenshotURLs: string[]
}

export interface News {
  title: string
  identifier: string
  caption: string
  tintColor: string
  imageURL: string
  appID: string
  date: Date
  notify: boolean
}

export interface UserInfo {}
