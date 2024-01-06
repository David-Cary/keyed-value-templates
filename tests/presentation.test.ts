import {
  KeyedTemplateResolver,
  DataViewDirective,
  DEFAULT_DIRECTIVES
} from '../src/index'

describe("DataViewDirective", () => {
  const resolver = new KeyedTemplateResolver(
    {
      ...DEFAULT_DIRECTIVES,
      present: new DataViewDirective()
    }
  )
  describe("execute", () => {
    test("should handle embedded templates", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          template: {
            $use: 'value',
            value: {
              $use: '+',
              args: [
                '[',
                {
                  $use: 'getVar',
                  path: ['text']
                },
                ']'
              ]
            }
          }
        },
        {}
      )
      expect(value).toBe("[wrapped]")
    })
    test("should support internal duplication with supporting context", () => {
      const source = [
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          template: {
            $use: 'value',
            value: {
              $use: '+',
              args: [
                '[',
                {
                  $use: 'getVar',
                  path: ['text']
                },
                ']'
              ]
            }
          }
        },
        {
          $use: 'present',
          data: {
            text: 'copy'
          },
          template: {
            $use: 'get',
            path: [
              'source',
              0,
              'template',
              'value'
            ]
          }
        }
      ]
      const value = resolver.resolveValue(
        source,
        { source }
      )
      expect(value).toEqual([
        "[wrapped]",
        "[copy]"
      ])
    })
    test("should handle context template references", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          template: {
            $use: 'get',
            path: ['wrapText']
          }
        },
        {
          wrapText: {
            $use: '+',
            args: [
              '[',
              {
                $use: 'getVar',
                path: ['text']
              },
              ']'
            ]
          }
        }
      )
      expect(value).toBe("[wrapped]")
    })
    test("should support variable reuse", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'some-text',
            delimiter: '-'
          },
          template: {
            $use: 'value',
            value: {
              source: {
                $use: 'getVar',
                path: ['text']
              },
              terms: {
                $use: 'present',
                data: {
                  delimiter: '-'
                },
                template: {
                  $use: 'getVar',
                  path: [
                    'text',
                    {
                      name: 'split',
                      args: [
                        {
                          $use: 'getVar',
                          path: ['delimiter']
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {}
      )
      expect(value).toEqual({
        source: "some-text",
        terms: [
          "some",
          "text"
        ]
      })
    })
    test("should support nested templates", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'some-text'
          },
          template: {
            $use: 'get',
            path: ['getSplitReport']
          }
        },
        {
          getSplitReport: {
            source: {
              $use: 'getVar',
              path: ['text']
            },
            terms: {
              $use: 'present',
              data: {
                delimiter: '-'
              },
              template: {
                $use: 'get',
                path: ['splitText']
              }
            }
          },
          splitText: {
            $use: 'getVar',
            path: [
              'text',
              {
                name: 'split',
                args: [
                  {
                    $use: 'getVar',
                    path: ['delimiter']
                  }
                ]
              }
            ]
          }
        }
      )
      expect(value).toEqual({
        source: "some-text",
        terms: [
          "some",
          "text"
        ]
      })
    })
    test("should support placeholders with coalese", () => {
      const context = {
        wrapText: {
          $use: '+',
          args: [
            '[',
            {
              $use: 'coalesce',
              args: [
                {
                  $use: 'getVar',
                  path: ['text']
                },
                '_na_'
              ]
            },
            ']'
          ]
        }
      }
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          template: {
            $use: 'get',
            path: ['wrapText']
          }
        },
        context
      )
      expect(value).toBe("[wrapped]")
      const blanked = resolver.resolveValue(
        {
          $use: 'present',
          template: {
            $use: 'get',
            path: ['wrapText']
          }
        },
        context
      )
      expect(blanked).toBe("[_na_]")
    })
  })
})
