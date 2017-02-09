---
title: Pandorabox之透明代理 
date: 2017-2-7
categories: [Openwrt]
tags: [路由器,科学上网,Shadowsocks,ChinaDNS]
grammar_cjkRuby: true
---

![enter description here][1]
先修改Lan接口，避免在无线中继的时候发生本地Lan接口与wwan接口发生冲突导致无法登陆路由器。

`网络 -> Lan -> IPv4地址， 设置为 192.168.33.1`更改之后需要重新连接一下网络。

透明代理使用`shadowsocks-libev`和`ChinDNS`实现。使用ssh登陆路由器，安装所需软件。

```bash
ssh root@192.168.33.1
opkg update
opkg install shadowsocks-libev luci-app-shadowsocks ChinaDNS luci-app-chinadns --force-checksum
```

这个版本的软件源有点问题，所以直接`opkg install`基本上都过不了`sha256sum`检测，所以需要加上`--force-checksum`参数强制忽略。两个luci界面都有zh-cn汉化包，为了节省路由器空间，就不装了。
<!--more-->
默认的chnroute表很老了，需要更新：

```bash
mv /etc/chnroute.txt /etc/chnroute.txt.bak
wget -O- 'http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest' | awk -F\| '/CN\|ipv4/ { printf("%s/%d\n", $4, 32-log($5)/log(2)) }' > /etc/chnroute.txt
# 如果没有问题
rm -rf /etc/chnroute.txt.bak
```

然后我们需要对其进行启用。

shadowsocks需要启动`ss-redir`来实现透明代理和`ss-tunnel`来实现UDP转发保证国外DNS查询不被污染。下面是具体需要注意的配置。

### SS-tunnel

```json
{
  "UDP Local Port": 1153,
  "Forwarding Tunnel": 8.8.8.8:53
}
```

### ChinaDNS

```javascript
{
  "Enable DNS compression pointer": true,
  "Local Port": 1053, //不能与ss-tunnel冲突 
  "CHNRoute File": "/etc/chnroute.txt",
  "Upstream Servers": "223.5.5.5,127.0.0.1:1153" //第一个是国内阿里DNS服务器，第二个是进过ss-tunnel转发后的Google DNS服务器
}
```

## DHCP/DNS

最后需要在`网络->DHCP/DNS->服务器设置`修改默认的DNS配置

```javascript
{
  "本地服务器": "127.0.0.1#1053", //ChinaDNS处理后的DNS服务器，可以根据ip分流。
  "忽略解析文件": true
}
```

总的来说，GoogleDNS(8.8.8.8:53)首先进过ss-tunnel转发到本地的`127.0.0.1:1153`上，然后通过ChinaDNS与国内DNS服务器融合成新的`127.0.0.1:1053` 实现了国内外分流。

## Update
由于实用过程中还是经常不稳定，决定采用DNS-Forwarder方案。
然而，官方并没有我的小米Mini路由架构的二进制包，只能自己动手丰衣足食了。

### OpenWrt SDK
首先明确小米路由器Mini的架构是ramips/mt7620a而现在运行的Pandorabox 16.10基于Openwrt Barrier Breaker。

### 依赖
```bash
sudo apt-get install git-core build-essential libssl-dev libncurses5-dev unzip gawk zlib1g-dev subversion mercurial
```
### 下载&编译
```bash 
curl https://downloads.openwrt.org/barrier_breaker/14.07/ramips/mt7620a/OpenWrt-SDK-ramips-for-linux-x86_64-gcc-4.8-linaro_uClibc-0.9.33.2.tar.bz2 | tar -xjf 
cd OpenWrt-SDK-*
git clone https://github.com/aa65535/openwrt-dns-forwarder.git package/dns-forwarder # 获取Makefile
make menuconfig # 选择要编译的包： Network -> dns-forwarder
make package/dns-forwarder/compile V=99
```
### 拷贝&安装
```bash
scp Downloads/dns-forwarder_1.1.1-1_ramips_24kec.ipk root@192.168.33.1:/root/dns-forwarder.ipk
scp Downloads/luci-app-dns-forwarder_1.6.0-1_all.ipk root@192.168.33.1:/root/luci-app-dns-forwarder.ipk
ssh root@192.168.33.1
opkg intall dns-forwarder.ipk luci-app-dns-forwarder.ipk
```


  [1]: https://ol1kreips.qnssl.com/PandoraBox.png "PandoraBox.png"
