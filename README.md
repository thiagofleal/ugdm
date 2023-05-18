# UGDM: Universal GIT Dependency Manager
UGDM is a dependency manager that uses only GIT to install packages, independently of the language

### Installing
- Clone the repository;
- Change the current directory to repository's folder;
- Install globally with **npm**;
```shell
git clone https://github.com/thiagofleal/ugdm.git
cd ugdm
npm i -g .
```

### Check if UGDM is installed
Use terminal/command prompt:
```shell
ugdm --version
```

### Using
Avaliable commands:
- **ugdm init**
Initialize GIT dependencies

- **ugdm add *[name]***
Add GIT dependency

- **ugdm remove *[name]***
Remove GIT dependency

- **ugdm install**
Install GIT dependencies

- **ugdm build**
Generate shell script to install dependencies

- **ugdm config**
Configure environment

