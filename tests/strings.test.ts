import {
  KeyedTemplateResolver,
  KeyValueMap,
  ParseStringDirective,
  DEFAULT_DIRECTIVES
} from '../src/index'
import { template } from 'lodash'

describe("KeyedTemplateResolver with string parser directive", () => {
  const resolver = new KeyedTemplateResolver({
    parse: new ParseStringDirective(
      (value: string, context: KeyValueMap) => {
        const compiled = template(value)
        return compiled(context)
      },
      (params: KeyValueMap) => {
        if(typeof params.text === 'string') {
          return {
            executable: false,
            value: {
              $use: 'call',
              target: template(params.text),
              args: [{ $use: 'context' }]
            }
          }
        }
        return {
          executable: true,
          value: undefined
        }
      }
    ),
    call: DEFAULT_DIRECTIVES.call,
    context: DEFAULT_DIRECTIVES.context
  })
  describe("resolveValue", () => {
    test("should process target strings with context", () => {
      const results = resolver.resolveValue(
        {
          style: 'friendly',
          greeting: {
            $use: 'parse',
            text: "Hi ${name}!"
          },
          ignored: "leave ${name} alone"
        },
        { name: 'Joe' }
      )
      expect(results).toEqual({
        style: 'friendly',
        greeting: "Hi Joe!",
        ignored: "leave ${name} alone"
      })
    })
  })
  describe("optimizeTemplate", () => {
    test("should perform the provided optimization handling", () => {
      const results = resolver.optimizeTemplate(
        {
          $use: 'parse',
          text: "Hi ${name}!"
        }
      )
      expect(results.value).toBeDefined()
      if(results.value != null) {
        const action = results.value as KeyValueMap
        expect(action.$use).toEqual('call')
        expect(action.args).toEqual([{ $use: 'context' }])
        const callback = action.target
        expect(typeof callback).toBe('function')
        if(typeof callback == 'function' && callback != null) {
          const callbackResult = callback({name: 'Ann'})
          expect(callbackResult).toEqual('Hi Ann!')
        }
      }
    })
  })
})
