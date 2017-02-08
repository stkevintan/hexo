---
title: 网易云音乐新API简述
date: 2017-2-8
tags: [网易云音乐,API,Encryption]
categories: [Web]
grammar_cjkRuby: true
---


新API采用了略微修改过的AES和RSA加密，主要用在登陆接口上，对新API进行简单的分析。
## Url
估计会抓包的人都知道，Url中的api便成了weapi。比如手机登录：
原来是：`http://music.163.com/api/login/cellphone/`
现在是：`http://music.163.com/weapi/login/cellphone/`

## 加密算法
核心过程如下：
```Javascript
    aesRsaEncrypt = function (text, pubKey, modulus, nonce) {
        var result = {};
        var secKey = createSecretKey(16);
        result.encText = aesEncrypt(text, nonce);
        result.encText = aesEncrypt(result.encText, secKey);
        result.encSecKey = rsaEncrypt(secKey, pubKey, modulus);
        return result;
    }
```
<!--more-->
其中_modulus\_nonce\pubKey均为已知(见输入），算法先通过createSecretKey生成一个16位的随机字符串作为密钥secKey，然后将要加密的文字text进行两次AES加密获得解密后的文字encText,因为secKey是在客户端上生成的，所以还需要对其进行RSA加密再传给服务端。

#### 输入
__Text:__ `JSON.stringify({phone:xxx,password:"md5 hashed Data",rememberLogin:"true"})`
__pubKey:__ `010001`
__nonce:__ `0CoJUm6Qyw8W8jud`
__modulus:__ `00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7`

#### 输出
```JSON
{
    params:result.encText,
    encSecKey:result.encSecKey
}
```

### 一些细节
1. AES加密的具体算法为:AES-128-CBC，输出格式为base64。
2. AES加密时需要指定iv：`0102030405060708`
3. RSA加密输出为Hex格式，公钥是`{N:modulus,e:pubKey}`
4. 我的Javascript实现：<https://github.com/stkevintan/nw_musicbox/blob/master/src/model/weCrypto.js>
5. RSA算法的JS实现方法参考：<http://www.cnblogs.com/kxdhm/archive/2012/02/02/2336103.html>

