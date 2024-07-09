const fs = require('fs') // 操作文件
const path = require('path') // 获取路径
const marked = require('marked') // 解析md文件
const axios = require('axios') // 请求
const Koa = require('koa') // 本地服务
const open = require('open') // 打开网址
const moment = require('moment') // 日期

// Github配置参数
class ParamGithub {
  title = ''
  owner = "HlkL" // GitHub repository 所有者
  repo = "HlkL.github.io" // GitHub repository
  clientID = "Ov23ctMS0p89s8Ze5fqv" // 自己的clientID
  clientSecret = "5f2152b27bc3b9e4ec63a154771e1e8ae445e847" // 自己的clientSecret
  admin = ["HlkL"] // GitHub repository 所有者
  labels = ["Gitalk"] // GitHub issue 的标签

  constructor(title) {
    this.title = title
  }
}

const writeConfigFile = () => {
  fs.writeFileSync(path.join(__dirname, './config.txt'), Array.from(configMap).map(arr => arr.join('=')).join(';'))
}

const appendErrorFile = (opera, message) => {
  const filePath = path.join(__dirname, './error.txt')
  if(!fs.existsSync(filePath)) fs.writeFileSync(filePath, '')
  const time = moment().format('yyyy-MM-DD HH:mm:ss')
  fs.appendFileSync(path.join(__dirname, './error.txt'), `${opera}报错 ${time})}\n ${message}\n`)
  console.log(`${opera}报错`, time)
}

// 本地配置
let config = ''
let configMap = new Map()
if(!fs.existsSync(path.join(__dirname, './config.txt'))) {
  writeConfigFile()
}
config = fs.readFileSync(path.join(__dirname, './config.txt'), 'utf-8')
configMap = new Map(config.split(';').map(text => text.split('=')))
let accessCode = configMap.get('accessCode') || ''
let accessToken = configMap.get('accessToken') || ''
let port = 3000

const axiosGithub = axios.create({
  baseURL: 'https://github.com',
  headers: {
    'accept': 'application/json'
  }
})
const axiosApiGithub = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'accept': 'application/json',
  }
})

// 规避控制台警告
marked.setOptions({
  mangle: false,
  headerIds: false,
})

// 获取md文件路径
const getMdFilesPath = (path, fileArr = []) => {
  const files = fs.readdirSync(path)
  files.forEach((file) => {
    const filePath = `${path}/${file}`
    stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      fileArr.concat(getMdFilesPath(filePath, fileArr))
    } else {
      fileArr.push(filePath)
    }
  })
  return fileArr.filter(i => i.split('.').pop() === 'md')
}

// 获取md文件标题
const getMdFileTitle = (path, fn) => {
  const fileContent = (marked.marked(fs.readFileSync(path, 'utf-8'))).toString()
  const startIndex = fileContent.indexOf('<h1>') === -1 ? 0 : fileContent.indexOf('<h1>') + 4
  const endIndex = fileContent.indexOf('</h1>') === -1 ? 0 : fileContent.indexOf('</h1>')
  const title = fileContent.substring(startIndex, endIndex)
  return title
}

// 打开网址
const openUrl = async (param = new ParamGithub()) => {
  const {
    clientID
  } = param
  const domain = 'https://github.com/login/oauth/authorize'
  const query = {
    client_id: clientID,
    redirect_uri: `http://localhost:${port}/`, // 回调地址
    scope: 'public_repo', // 用户组
  }
  const url = `${domain}?${Object.keys(query).map(key => `${key}=${query[key]}`).join('&')}`
  await open(url)
}

// 监听code获取
const startupKoa = () => {
  const app = new Koa()
  const _server = app.listen(port)
  openUrl()
  app.use(ctx => {
    const urlArr = ctx.originalUrl.split("=")
    if (urlArr[0].indexOf("code") > -1) {
      accessCode = urlArr[1]
      createIssues()
      configMap.set('accessCode', accessCode)
      writeConfigFile()
      _server.close()
    }
    // 拿到code后关闭回调页面
    ctx.response.body = `<script>
      (function () {
        window.close()
      })(this)
    </script>`
  })
}

// 获取token
const getAccessToken = (param = new ParamGithub()) => {
  const {
    clientID,
    clientSecret
  } = param
  return axiosGithub
    .post('/login/oauth/access_token', {
      code: accessCode,
      client_id: clientID,
      client_secret: clientSecret
    }).then(res => {
      return Promise.resolve(res.data.error === 'bad_verification_code' ? null : res.data.access_token)
    }).catch(err => {
      appendErrorFile('获取token', err.response.data.message)
    })
}

// 获取授权
const getAuth = () => {
  return getAccessToken()
    .then(res => {
      configMap.set('accessToken', res)
      writeConfigFile()
      return res
    })
}

// 批量创建issue
const createIssues = async () => {
  if (accessCode) {
    const token = await getAuth()
    if(token) {
      accessToken = token;
      mdFileTitleArr.forEach(title => {
        getIssues(new ParamGithub(title))
      })
    } else {
      accessCode  = ''
      createIssues()
    }
  } else {
    startupKoa()
  }
}

// 获取issues
const getIssues = (param) => {
  const {
    owner,
    repo,
    clientID,
    clientSecret,
    labels,
    title
  } = param || {}
  axiosApiGithub
    .get(`/repos/${owner}/${repo}/issues`, {
      auth: {
        username: clientID,
        password: clientSecret
      },
      params: {
        labels: labels.concat(title).map(label => typeof label === 'string' ? label : label.name).join(','),
        t: Date.now()
      }
    }).then((res) => {
      if (!(res && res.data && res.data.length)) {
        createIssue(param);
      }
    }).catch(err => {
      console.log(err)
      appendErrorFile('获取issues', err?.response?.data?.message || '网络问题')
    });
}

// 创建issues
const createIssue = (param) => {
  const {
    owner,
    repo,
    labels,
    title
  } = param || {}
  axiosApiGithub
    .post(`/repos/${owner}/${repo}/issues`, {
      title: `${title}`,
      labels: labels.concat(title).map(label => typeof label === 'string' ? {
        name: label
      } : label),
      body: 'note'
    }, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }).then(() => {
      console.log(`创建成功：${title}`)
    }).catch((err) => {
      appendErrorFile('创建issues', err.response.data.message)
      if(['Not Found', 'Bad credentials'].includes(err.response.data.message)) {
        getAccessToken()
      }
    });
}

// 读取本地文件
const mdFilePathArr = getMdFilesPath(path.join(__dirname, '../docs'))
const mdFileTitleArr = mdFilePathArr.map(path => getMdFileTitle(path)).filter(i => i)

// 调用授权函数
createIssues()