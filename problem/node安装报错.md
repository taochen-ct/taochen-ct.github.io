### 1. nodejs安装gitbook报错

问题原因：gitbook-cli引用了旧版的graceful-fs，导致出现问题，gitbook与nodejs版本不匹配

问题解决：nodejs 版本过高，下载nvm安装一个10.X的node