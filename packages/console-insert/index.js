import parser from '@babel/parser'
import t from '@babel/traverse'
import g from '@babel/generator'
import types from '@babel/types'
import template from '@babel/template'
const traverse = t.default
const generator = g.default
let code = `console.log(1);
function test(){
  console.log(2)
}
`

const targetCallerName = Object.keys(console).map(item => `console.${item}`)
const ast = parser.parse(code, { sourceType: "unambiguous" })
traverse(ast, {
  CallExpression: (path, state) => {
    if (path.node.isInsert) return;
    if (targetCallerName.includes(path.get('callee').toString())) {
      const { line, column } = path.node.loc.start

      // !add arguments
      // path.node.arguments.unshift(types.stringLiteral(`file:${line},${column}`))

      // !add console.log node
      const newNode = template.expression(`console.log("file:${line}，${column}")`)()
      newNode.isInsert = true
      path.insertBefore(newNode)
    }
  }
})
console.log(generator(ast).code)