# git笔记

- 初始化本地仓库

  ```git
  git init
  ```

- 加入暂存区

  ```git
  git add ,
  ```

- 提交commit

  ```git
  git commit -m "commit info"
  ```

- 关联远程仓库

  ```git
  git remote add origin 仓库地址
  ```

- 将远程端版本合并到本地版本中

  ```git
  git pull origin main
  ```

- 提交远程仓库

  ```git
  git push remote <remote> <branch>
  git push -u origin main
  ```

- 删除远程端分支

  ```git
  git push <remote> :<branch> (since Git v1.5.0)
  git push <remote> --delete <branch> (since Git v1.7.0)
  ```

- 将修改作为当前分支的草稿保存

  ```gi
  git stash
  ```

- 查看草稿列表

  ```git
  git stash list
  ```

- 删除草稿

  ```git
  git stash drop stash@{0}
  ```

- 读取草稿

  ```git
  git stash apply stash@{0}
  ```

- 克隆远程仓库

  ```git
  git clone 仓库地址
  ```

- 下载远程端版本，但不合并到HEAD中

  ```text
  git fetch <remote>
  ```

- 显示与上次版本的差异

  ```git
  git diff
  ```

- 列出所有的分支

  ```git
  git branch
  ```

- 列出所有的远端分支

  ```git
  git branch -r
  ```

- 基于当前分支创建新分支

  ```git
  git brance <new-branch>
  ```

- 基于远程分支创建新的可追溯的分支

  ```git
  git branch --track <new-branch> <remote-branch>
  ```

- 删除本地分支

  ```git
  git branch -d <branch>
  ```

- 强制删除本地分支，将会丢失未合并的修改

  ```git
  git branch -D <branch>
  ```