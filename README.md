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


## Example

Here we have a simple user model to demonstrate how  *JMF* works.

``` javascript
// Fire me up! 

module.exports = {
	implements: 'model:users',
	inject: [ 'mongo/objectid' ]
}

module.exports.factory = function (oid) {
	return {
		idGenerator: oid,
		schema: {
			_id: { mandatory: true, type: 'objectid' },
			name: { mandatory: true, type: 'string' },
			email: { mandatory: true, type: 'string' },
			admin: { type: 'boolean' },
		},
		index: [ 'email' ]
	};
}
```


### discovery

Listing the installed models.

```
> curl -k https://locahost:8000/_discover
{
  "models": [
    "user"
  ]
}
```

### create

Notice: The user object is not the toplevel object in the request.

```
> curl -k -H "Content-Type: application/json" -X POST \
> https://localhost:8000/users --data @- <<EOF 
> {
>   "users": {
>     "name": "Max Mustermann",
>     "email": "max@mustermann.tld",
>     "admin": false
>   }
> }
> EOF
{
  "name": "Max Mustermann",
  "email": "max@mustermann.tld",
  "admin": false,
  "created_at": "2015-09-11T14:42:58.605Z",
  "_id": "55f2e87276418f4d3c64d56e"
}
```

### fetch

```
> curl -k https://localhost:8000/users
{
  "meta": {
    "count": 1,
    "limit": 50,
    "page": 0
  },
  "users": [
    {
      "_id": "55f2e87276418f4d3c64d56e",
      "name": "Max Mustermann",
      "email": "max@mustermann.tld",
      "admin": false,
      "created_at": "2015-09-11T14:42:58.605Z"
    }
  ],
  "links": {},
  "linked": {}
}
```

### fetch a single user

```
> curl -k https://localhost:8000/users/55f2e87276418f4d3c64d56e
{
  "users": {
    "_id": "55f2e87276418f4d3c64d56e",
    "name": "Max Mustermann",
    "email": "max@mustermann.tld",
    "admin": false,
    "created_at": "2015-09-11T16:02:59.357Z"
  },
  "links": {},
  "linked": {}
}
```

### update

Promote Max Mustermann as admin.

```
> curl -k -H "Content-Type: application/json" -X PUT \
> https://localhost:8000/users/55f2e87276418f4d3c64d56e --data @- <<EOF
> {
>   "users": {
>     "admin": true
>   }
> }
> EOF
{
  "users": {
    "_id": "55f2e87276418f4d3c64d56e",
    "name": "Max Mustermann",
    "email": "max@mustermann.tld",
    "admin": true,
    "created_at": "2015-09-11T15:35:47.971Z",
    "updated_at": "2015-09-11T15:52:28.127Z"
  }
}
```

### delete

The servers response is empty if the request was sucessful.

```
> curl -k -X DELETE https://localhost:8000/users/55f2fa1f7449c430405b3583 -i

HTTP/1.1 200 OK
X-Powered-By: Express
Vary: Origin
Date: Fri, 11 Sep 2015 15:58:35 GMT
Connection: keep-alive
Content-Length: 0
```
