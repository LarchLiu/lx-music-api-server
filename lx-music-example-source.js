/*!
 * @name 替换为你的音乐源名称
 * @description 替换为你的音乐源介绍
 * @version v1.0.1
 * @author Folltoshe & helloplhm-qwq
 * @repository https://github.com/lxmusics/lx-music-api-server
 */

// 是否开启开发模式
const DEV_ENABLE = false
// 服务端地址
const API_URL = 'http://xxx.com'
// 服务端配置的请求key
const API_KEY = ''
// 音质配置(key为音源名称,不要乱填.音质如果你账号为VIP可以填写到hires)
const MUSIC_QUALITY = {
  kw: ['128k'],
  kg: ['128k'],
  tx: ['128k'],
  wy: ['128k'],
  mg: ['128k'],
}
// 音源配置(默认为自动生成,可以修改为手动)
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY)

/**
 * 下面的东西就不要修改了
 */
const { EVENT_NAMES, request, on, send, utils, env } = globalThis.lx

const httpFetch = (url, options = { method: 'GET' }) => {
  return new Promise((resolve, reject) => {
    request(url, options, (err, resp) => {
      if (err) return reject(err)
      resolve(resp)
    })
  })
}

const handleGetMusicUrl = async (source, musicInfo, quality) => {
  const songId = musicInfo.hash ?? musicInfo.songid

  const request = await httpFetch(`${API_URL}/${source}/${songId}/${quality}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `${env ? `lx music ${env} request` : 'lx music request'}`,
      'X-Request-Key': API_KEY,
    },
  })
  const { body } = request

  if (!body || !body.code) throw new Error('unknow error')
  if (body.code === 200) return body.data

  switch (body.code) {
    case 1:
      throw new Error('block ip')
    case 2:
      throw new Error('get music url faild')
    case 4:
      throw new Error('internal server error')
    case 5:
      throw new Error('too many requests')
    case 5:
      throw new Error('param error')
    default:
      throw new Error(body.message ?? 'unknow error')
  }
}

const musicSources = []
MUSIC_SOURCE.forEach(item => {
  musicSources.push({
    name: item,
    type: 'music',
    actions: ['musicUrl'],
    qualitys: MUSIC_QUALITY[item],
  })
})

on(EVENT_NAMES.request, ({ source, info: m }) => {
  switch (action) {
    case 'musicUrl':
      console.group(`Handle Action(musicUrl)`)
      console.log('source', source)
      console.log('quality', info.type)
      console.log('musicInfo', info.musicInfo)
      console.groupEnd()
      return handleGetMusicUrl(source, info.musicInfo, info.type)
        .then(url => Promise.resolve(url))
        .catch(err => Promise.reject(err))
    default:
      console.error(`action(${action}) not support`)
      return Promise.reject('action not support')
  }
})
send(EVENT_NAMES.inited, { status: true, openDevTools: DEV_ENABLE, sources: musicSources })
