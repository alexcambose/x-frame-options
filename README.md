# x-frame-options
x-frame-options bypass
## Instalation
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
[live demo](https://x-frame-options-bypass.herokuapp.com/)