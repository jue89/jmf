# JMF

Okay. I accidentally built a whole framework for some JSON magic with RESTful HTTP foobar. When I started working on this project it was supposed to be a data store for accounting stuff. I realised that I was doing a horrible mistake again: copying a lot of code. Finally I decided to spend some time on refactoring and *JMF* was born.

The idea is that only models and their relation ships have to be defined and all related routes and so on magically appear. I got inspired by the work of [JSONAPI](http://jsonapi.org). In the backend MongoDB is used due to its wonderful capability of master-slave clustering and the type-safe way to store things. The lack of missing relation ships between collections is solved by *JMF*. At least kind of ...

At the moment it's just the bare framework with absolutely no functionality since no models are defined. Some day I might add some example code. So stay tuned!

If you would like to know the long term of the abbreviation *JMF*, invite me for a beer. I might tell you but don't expect too much.


## Getting Started

Install NodeJS (0.12 is tested) and NPM.

```
$ git clone https://github.com/jue89/jmf.git
$ npm install
$ npm start
```

Define some models and hooks.
