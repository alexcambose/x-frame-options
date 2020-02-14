# x-frame-options
x-frame-options bypass
## Installation
```text
npm install
```
## Usage
```text
npm run start
```

instead of using `iframe` source with the actual link of the website:
```html
<iframe src="https://example.com/"></iframe>
```
use
```html
<iframe src="http://localhost:3000?url=https://example.com/"></iframe>
```

## Demo
[live demo](http://x-frame-options-bypass.herokuapp.com/)

---

[nodejs](http://x-frame-options-bypass.herokuapp.com/?url=https://nodejs.org/en/)

[stackoverflow](http://x-frame-options-bypass.herokuapp.com/?url=https://stackoverflow.com)

[github](http://x-frame-options-bypass.herokuapp.com/?url=https://github.com/)
