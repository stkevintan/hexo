title: "ACM International Collegiate Programming Contest Asia Regional Contest, Tokyo Problem D Space Golf"
categories:
  - ACM
date: 2014-10-19 21:20:03
tags: 暴力
---
原题pdf：[click here](http://judge.u-aizu.ac.jp/onlinejudge/contest/ICPCOOC2014/D.pdf)
<br/>

- - -

日本的亚洲区域赛真心简单啊。两个小时就刷了5题有余了。排名第一的队伍才做出7道。

题目真心长的可以了，看了半个小时才明白。。

题意其实也就是太空中向前方抛小球，问小球能够穿过N个障碍物后到达制定地点的最小初始速度是多少。非常暴力的模拟题。离散化后直接枚举弹跳的次数再取最小值即可。注意45°方向能成功的话，那还是45°最优。
<!--more-->
```C++
#include&lt;map&gt;
#include&lt;set&gt;
#include&lt;cmath&gt;
#include&lt;stack&gt;
#include&lt;queue&gt;
#include&lt;string&gt;
#include&lt;cstdio&gt;
#include&lt;vector&gt;
#include&lt;cctype&gt;
#include&lt;cassert&gt;
#include&lt;utility&gt;
#include&lt;numeric&gt;
#include&lt;cstring&gt;
#include&lt;iostream&gt;
#include&lt;algorithm&gt;
using namespace std;
#define pr pair
#define PR pair&lt;int,int&gt;
#define MP make_pair
#define SI(x) set::iterator
#define VI(x) vector::iterator
#define MI(x,y) map&lt;x,y&gt;::iterator
#define SRI(x) set::reverse_iterator
#define VRI(x) vector::reverse_iterator
#define MRI(x,y) map&lt;x,y&gt;::reverse_iterator
#define F first
#define S second
#define Sz(x) (int)x.size()
#define clrQ(x) while(!x.empty)x.pop();
#define clr(x,y) memset(x,y,sizeof(x));
#if defined (_WIN32) || defined (__WIN32) || defined (WIN32) || defined (__WIN32__)
#define LL __int64
#define LLS "%" "I" "6" "4" "d"
#define LLU "%" "I" "6" "4" "u"
#define LL_MAX _I64_MAX
#else
#define LL long long
#define LLS "%" "l" "l" "d"
#define LLU "%" "l" "l" "u"
#define LL_MAX _I64_MAX
#endif
const int inf = ~0u &gt;&gt; 1;
const LL lnf = ~0ull &gt;&gt; 1;
#define eps 1e-8
/*start*/
int d, n, b;
PR ob[20];
vector&lt;pair&lt;double, double&gt; &gt; vt;
pair&lt;double, double&gt; dpr;
double a[2][2], e[2];
pair&lt;double, double&gt; Cramer(pair&lt;double, double&gt; dpr) {
	pair&lt;double, double&gt; res;
	a[1][0] = dpr.F * dpr.F;
	a[1][1] = dpr.F;
	e[1] = dpr.S;
	double div = a[0][0] * a[1][1] - a[1][0] * a[0][1];
	res.F = (e[0] * a[1][1] - e[1] * a[0][1]) / div;
	res.S = (e[1] * a[0][0] - e[0] * a[1][0]) / div;
	return res;
}
int main(int argc, char **argv) {
	while (~scanf("%d%d%d", &amp;d, &amp;n, &amp;b)) {
		for (int i = 0; i &lt; n; i++) {
			scanf("%d%d", &amp;ob[i].F, &amp;ob[i].S);
		}
		double ans = inf;
		for (int c = 0; c &lt;= b; c++) {//enumerate the times bullet bounces the surface
			double dist = 1.0 * d / (c + 1);
			int f = 1;
			a[0][0] = dist * dist;
			a[0][1] = dist;
			e[0] = 0;
			vt.clear();
			for (int i = 0; i &lt; n; i++) {
				dpr = ob[i];
				while (dpr.F + eps &gt;= dist) {
					dpr.F -= dist;
				}
				if (dpr.F &lt;= eps) {
					f = 0;
					break;
				}
				vt.push_back(dpr);
			}
			if (f == 0) continue;
			pair&lt;double, double&gt; res;   
			for (int i = 0; i &lt; Sz(vt); i++) {
				dpr = vt[i];
				if (i == 0) {
					res = Cramer(dpr);
				} else {
					double tmph = dpr.F * dpr.F * res.F + dpr.F * res.S;
					if (tmph + eps &lt; dpr.S) {
						res = Cramer(dpr);
					}
				}
			}
			res.F = -1.0 / (2 * res.F);
			res.S = res.F * res.S * res.S;
			ans = min(ans, sqrt(res.F + res.S));
                        //if the vector's angle is less than 45
			if (res.S + eps &lt; res.F) ans = min(ans, sqrt(dist));
		}
		printf("%.5f\n", ans);
	}
}
```
