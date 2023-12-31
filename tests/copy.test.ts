import {
  KeyedTemplateResolver,
  DEFAULT_DIRECTIVES
} from '../src/index'

describe("KeyedTemplateResolver", () => {
  const resolver = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)
  describe("createDeepCopy", () => {
    test("should reuse existing copies to avoid infinite cloning loops", () => {
      const item: Record<string, any> = {
        value: 1
      }
      item.self = item
      const clone = resolver.createDeepCopy(item) as Record<string, any>
      expect(clone.self).toEqual(clone)
    })
  })
})
