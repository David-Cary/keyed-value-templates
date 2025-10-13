import {
  KeyedTemplateResolver,
  DataViewDirective,
  MapValuesDirective,
  DEFAULT_DIRECTIVES
} from '../src/index'

describe("DataViewDirective", () => {
  const resolver = new KeyedTemplateResolver(
    {
      ...DEFAULT_DIRECTIVES,
      present: new DataViewDirective(),
      remap: new MapValuesDirective()
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
    test("should use via property if template property is absent", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          via: {
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
    test("should skip initial template resolution if preprocessing is off", () => {
      const value = resolver.resolveValue(
        {
          $use: 'present',
          data: {
            text: 'wrapped'
          },
          via: {
            $use: '+',
            args: [
              '[',
              {
                $use: 'getVar',
                path: ['text']
              },
              ']'
            ]
          },
          preprocess: false
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
  test("should support recursive views if a template key is provided", () => {
    const value = resolver.resolveValue(
      {
        $use: 'present',
        data: {
          target: {
            value: "A",
            children: [
              {
                value: "A1",
                children: []
              },
              {
                value: "A2",
                children: [
                  {
                    value: "A2.1"
                  }
                ]
              }
            ]
          }
        },
        template: {
          $use: 'value',
          value: {
            text: {
              $use: 'getVar',
              path: [
                'target',
                'value'
              ]
            },
            items: {
              $use: 'getVar',
              path: [
                'target',
                'children',
                {
                  name: 'map',
                  args: [
                    {
                      $use: 'callback',
                      value: {
                        $use: 'present',
                        data: {
                          target: {
                            $use: 'get',
                            path: [
                              '$args',
                              0
                            ]
                          }
                        },
                        template: {
                          $use: 'getVar',
                          path: ['$template']
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        },
        templateKey: '$template'
      },
      {}
    )
    expect(value).toEqual({
      text: "A",
      items: [
        {
          text: "A1",
          items: []
        },
        {
          text: "A2",
          items: [
            {
              text: "A2.1"
            }
          ]
        }
      ]
    })
  })
  test("if MapValuesDirective is available, should be able to use that for recursion", () => {
    const value = resolver.resolveValue(
      {
        $use: 'present',
        data: {
          target: {
            value: "A",
            children: [
              {
                value: "A1",
                children: []
              },
              {
                value: "A2",
                children: [
                  {
                    value: "A2.1"
                  }
                ]
              }
            ]
          }
        },
        template: {
          $use: 'value',
          value: {
            text: {
              $use: 'getVar',
              path: [
                'target',
                'value'
              ]
            },
            items: {
              $use: 'remap',
              source: {
                $use: 'getVar',
                path: [
                  'target',
                  'children'
                ]
              },
              getValue: {
                $use: 'present',
                data: {
                  target: {
                    $use: 'getVar',
                    path: ['$value']
                  }
                },
                template: {
                  $use: 'getVar',
                  path: ['$template']
                }
              }
            }
          }
        },
        templateKey: '$template'
      },
      {}
    )
    expect(value).toEqual({
      text: "A",
      items: [
        {
          text: "A1",
          items: []
        },
        {
          text: "A2",
          items: [
            {
              text: "A2.1"
            }
          ]
        }
      ]
    })
  })
})
