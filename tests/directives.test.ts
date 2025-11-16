import {
  KeyedTemplateResolver,
  KeyValueMap,
  DEFAULT_DIRECTIVES
} from '../src/index'

describe("KeyedTemplateResolver with default directives", () => {
  const resolver = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)
  describe("cast directive", () => {
    test("should be able to cast string to numbers", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: '17',
          as: 'number'
        },
        {}
      )
      expect(value).toBe(17)
    })
    test("should be able convert json strings to objects as requested", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: `{"name": "Sara"}`,
          as: 'object'
        },
        {}
      )
      expect(value).toEqual({ name: 'Sara' })
    })
    test("should wrap non-json strings in an object", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: `"name": "Sara"`,
          as: 'object'
        },
        {}
      )
      expect(value).toEqual({ value: '"name": "Sara"' })
    })
    test("should be able convert json strings to arrays as requested", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: "[1,4]",
          as: 'array'
        },
        {}
      )
      expect(value).toEqual([1,4])
    })
    test("should be avoid conversion if the type is listed as an alternative", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: 2,
          as: ['string', 'number']
        },
        {}
      )
      expect(value).toBe(2)
    })
    test("should be wrap the value if asked to cast to a function", () => {
      const value = resolver.resolveValue(
        {
          $use: 'cast',
          value: 2,
          as: 'function'
        },
        {}
      )
      expect(typeof value).toBe('function')
      if(typeof value === 'function') {
        expect(value()).toBe(2)
      }
    })
  })
  describe("get directive", () => {
    test("should retrieve a nested value", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: ['users', 0, 'name']
        },
        {
          users: [
            { name: 'Joe' }
          ]
        }
      )
      expect(value).toBe("Joe")
    })
    test("should retrieve a copy of the context if there's no path", () => {
      const context = { id: 1 }
      const template = {
        $use: 'get'
      }
      const value = resolver.resolveValue(template, context)
      expect(value).toEqual({
        ...context,
        $resolving: {
          source: template
        }
      })
      expect(value).not.toBe(context)
    })
    test("should be able to call provided array functions", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'chars',
            {
              name: 'at',
              args: [-1]
            }
          ]
        },
        {
          chars: ['x', 'y', 'z']
        }
      )
      expect(value).toBe("z")
    })
    test("should be able to use predicates in array functions", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'chars',
            {
              name: 'find',
              args: [
                {
                  $use: 'callback',
                  value: {
                    $use: '==',
                    args: [
                      {
                        $use: 'get',
                        path: ['$args', 0, 'name']
                      },
                      'Max'
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          chars: [
            {
              name: 'Sam'
            },
            {
              name: 'Max'
            }
          ]
        }
      )
      expect(value).toEqual({ name: 'Max' })
    })
    test("should be able to call nested fuctions", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            {
              name: 'brace',
              args: ['me']
            }
          ]
        },
        {
          brace: (text: string) => `[${text}]`
        }
      )
      expect(value).toBe("[me]")
    })
    test("nested fuctions should respect 'this' argument", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'resolver',
            {
              name: 'getDirectiveIdFor',
              args: [
                {
                  $use: 'na'
                }
              ]
            }
          ]
        },
        {
          resolver
        }
      )
      expect(value).toBe("na")
    })
    test("should allow extending objects via the Object constructor", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'Object',
            {
              name: 'assign',
              args: [
                {
                  a: 1,
                  b: 1
                },
                {
                  $use: 'get',
                  path: ['value']
                },
                {
                  c: 3
                }
              ]
            }
          ]
        },
        {
          Object,
          value: {
            b: 2,
            c: 2
          }
        }
      )
      expect(value).toEqual({
        a: 1,
        b: 2,
        c: 3
      })
    })
    test("should be able to flatten a provided array", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          source: [
            ['a'],
            {
              $use: 'get',
              path: ['value']
            },
            'c'
          ],
          path: { name: 'flat' }
        },
        {
          value: ['b']
        }
      )
      expect(value).toEqual(['a', 'b', 'c'])
    })
    test("shouldn't modify underlying arrays", () => {
      const source = {
        list: []
      }
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'list',
            {
              name: 'push',
              args: ['x']
            }
          ]
        },
        source
      )
      expect(value).toEqual(1)
      expect(source.list).toEqual([])
    })
    test("should create a copy of the target", () => {
      const source = {
        item: { name: 'it' }
      }
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: [
            'item'
          ]
        },
        source
      )
      source.item.name = 'not'
      expect(value).toEqual({ name: 'it' })
    })
    test("should be usable as a simplified switch / key-value check", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: {
            $use: 'get',
            path: ['value']
          },
          source: {
            'on': 'active',
            'off': 'inactive'
          }
        },
        { value: 'on' }
      )
      expect(value).toBe('active')
    })
    test("should return the default if key in not in source", () => {
      const value = resolver.resolveValue(
        {
          $use: 'get',
          path: {
            $use: 'get',
            path: ['value']
          },
          source: {
            'on': 'active',
            'off': 'inactive'
          },
          default: 'error'
        },
        { value: '?' }
      )
      expect(value).toBe('error')
    })
    test("should be able to access resolution state stack", () => {
      const template = {
        name: 'Bob',
        item: {
          ownerName: {
            $use: 'get',
            path: ['$resolving', 'parent', 'parent', 'source', 'name']
          }
        }
      }
      const value = resolver.resolveValue(template)
      expect(value).toEqual({
        ...template,
        item: {
          ownerName: template.name
        }
      })
    })
  })
  describe("if-then directive", () => {
    test("should return then clause if value is true", () => {
      const value = resolver.resolveValue(
        {
          $use: 'if',
          if: {
            $use: 'get',
            path: ['value']
          },
          then: 'true',
          else: 'false'
        },
        { value: true }
      )
      expect(value).toBe('true')
    })
    test("should return else clause if value is false", () => {
      const value = resolver.resolveValue(
        {
          $use: 'if',
          if: {
            $use: 'get',
            path: ['value']
          },
          then: 'true',
          else: 'false'
        },
        { value: false }
      )
      expect(value).toBe('false')
    })
  })
  describe("literal value directive", () => {
    test("should use exact value, ignoring any directives", () => {
      const value = resolver.resolveValue(
        {
          $use: 'value',
          value: {
            $use: 'get',
            path: [
              {
                $use: 'get',
                source: [1],
                path: [0]
              }
            ]
          }
        },
        {
          value: ['b']
        }
      )
      expect(value).toEqual({
        $use: 'get',
        path: [
          {
            $use: 'get',
            source: [1],
            path: [0]
          }
        ]
      })
    })
  })
  describe("function call directive", () => {
    test("should call the provided function with the given arguments", () => {
      const value = resolver.resolveValue(
        {
          $use: 'call',
          target: (a: number, b: number) => a + b,
          args: [
            {
              $use: 'get',
              path: ['value']
            },
            1
          ]
        },
        {
          value: 3
        }
      )
      expect(value).toEqual(4)
    })
  })
  describe("optimizeTemplate", () => {
    test("should execute directive with no content references or other special handling", () => {
      const result = resolver.optimizeTemplate(
        [
          {
            $use: 'if',
            if: true,
            then: 1
          },
          2
        ]
      )
      expect(result.value).toEqual([1, 2])
    })
    test("should avoid processing context dependent directives", () => {
      const result = resolver.optimizeTemplate(
        [
          {
            $use: 'if',
            if: true,
            then: 1
          },
          {
            $use: 'if',
            if: {
              $use: 'get',
              path: ['value']
            },
            then: 1
          },
          {
            $use: 'get'
          }
        ]
      )
      expect(result.value).toEqual([
        1,
        {
          $use: 'if',
          if: {
            $use: 'get',
            path: ['value']
          },
          then: 1
        },
        {
          $use: 'get'
        }
      ])
    })
    test("should process primative literal values", () => {
      const result = resolver.optimizeTemplate(
        [
          {
            $use: 'value',
            value: 1
          },
          {
            $use: 'value',
            value: 'a'
          }
        ]
      )
      expect(result.value).toEqual([1, 'a'])
    })
    test("should preserve object literals", () => {
      const result = resolver.optimizeTemplate(
        [
          {
            $use: 'value',
            value: 1
          },
          {
            $use: 'value',
            value: {
              $use: 'if',
              if: true,
              then: 1
            }
          }
        ]
      )
      expect(result.value).toEqual([
        1,
        {
          $use: 'value',
          value: {
            $use: 'if',
            if: true,
            then: 1
          }
        }
      ])
    })
  })
  describe("InequalityDirective directive", () => {
    test("should perform a basic equality check", () => {
      const value = resolver.resolveValue(
        [
          {
            $use: '==',
            args: [1, 1]
          },
          {
            $use: '==',
            args: [1, 2]
          },
          {
            $use: '==',
            args: [1, 1, 2]
          }
        ],
        {}
      )
      expect(value).toEqual([true, false, false])
    })
  })
  describe("less than directive", () => {
    test("should act as an ascending order check", () => {
      const value = resolver.resolveValue(
        [
          {
            $use: '<',
            args: [1, 1]
          },
          {
            $use: '<',
            args: [1, 2]
          },
          {
            $use: '<',
            args: [1, 2, 3]
          }
        ],
        {}
      )
      expect(value).toEqual([false, true, true])
    })
  })
  describe("negation directive", () => {
    test("should flip the boolean value of the target", () => {
      const value = resolver.resolveValue(
        [
          {
            $use: 'not',
            value: true
          },
          {
            $use: 'not',
            value: []
          },
          {
            $use: 'not',
            value: null
          }
        ],
        {}
      )
      expect(value).toEqual([false, false, true])
    })
  })
  describe("command sequence directive", () => {
    test("should use first return directive", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'return',
              value: 1
            },
            {
              $use: 'return',
              value: 2
            }
          ]
        },
        {}
      )
      expect(value).toEqual(1)
    })
    test("should be able to use local values", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['x'],
              value: 1
            },
            {
              $use: 'return',
              value: {
                $use: 'getVar',
                path: ['x']
              }
            }
          ]
        },
        {}
      )
      expect(value).toEqual(1)
    })
    test("should respect scope of local variables", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['x'],
              value: 1
            },
            {
              $use: 'set',
              path: ['y'],
              value: {
                $use: 'run',
                steps: [
                  {
                    $use: 'set',
                    path: ['x'],
                    value: 2
                  },
                  {
                    $use: 'return',
                    value: {
                      $use: 'getVar',
                      path: ['x']
                    }
                  }
                ]
              }
            },
            {
              $use: 'return',
              value: {
                $use: '+',
                args: [
                  {
                    $use: 'getVar',
                    path: ['x']
                  },
                  {
                    $use: 'getVar',
                    path: ['y']
                  }
                ]
              }
            }
          ]
        },
        {}
      )
      expect(value).toEqual(3)
    })
    test("should be able to modify array", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['list'],
              value: []
            },
            {
              $use: 'set',
              path: [
                'list',
                {
                  name: 'push',
                  args: ['x']
                }
              ]
            },
            {
              $use: 'return',
              value: {
                $use: 'getVar',
                path: ['list']
              }
            }
          ]
        },
        {}
      )
      expect(value).toEqual(['x'])
    })
  })
  describe("repetition directive", () => {
    test("iterate over the provided range", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['indices'],
              value: []
            },
            {
              $use: 'repeat',
              from: 2,
              to: 6,
              rate: 2,
              steps: [
                {
                  $use: 'set',
                  path: [
                    'indices',
                    {
                      name: 'push',
                      args: [
                        {
                          $use: 'getVar',
                          path: ['$index']
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $use: 'return',
              value: {
                $use: 'getVar',
                path: ['indices']
              }
            }
          ]
        },
        {}
      )
      expect(value).toEqual([2, 4, 6])
    })
  })
  describe("iteration directive", () => {
    test("iterate over the provided collection", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['indices'],
              value: []
            },
            {
              $use: 'set',
              path: ['values'],
              value: []
            },
            {
              $use: 'forEach',
              for: ['a', 'b'],
              steps: [
                {
                  $use: 'set',
                  path: [
                    'indices',
                    {
                      name: 'push',
                      args: [
                        {
                          $use: 'getVar',
                          path: ['$index']
                        }
                      ]
                    }
                  ]
                },
                {
                  $use: 'set',
                  path: [
                    'values',
                    {
                      name: 'push',
                      args: [
                        {
                          $use: 'getVar',
                          path: ['$value']
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $use: 'return',
              value: {
                indices: {
                  $use: 'getVar',
                  path: ['indices']
                },
                values: {
                  $use: 'getVar',
                  path: ['values']
                }
              }
            }
          ]
        },
        {}
      )
      expect(value).toEqual({
        indices: [0, 1],
        values: ['a', 'b']
      })
    })
  })
  describe("resolve directive", () => {
    test("should enable using templates from context", () => {
      const value = resolver.resolveValue(
        {
          $use: 'resolve',
          value: {
            $use: 'get',
            path: [
              'template'
            ]
          }
        },
        {
          template: {
            $use: '+',
            args: ['a', 'b']
          }
        }
      )
      expect(value).toEqual('ab')
    })
    test("should allow resolving a literal directive object", () => {
      const value = resolver.resolveValue(
        {
          $use: 'resolve',
          value: {
            $use: 'value',
            value: {
              $use: '+',
              args: ['a', 'b']
            }
          }
        },
        {}
      )
      expect(value).toEqual('ab')
    })
  })
  describe("switch directive", () => {
    test("should respect breaks", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['items'],
              value: []
            },
            {
              $use: 'switch',
              value: {
                $use: 'get',
                path: ['value']
              },
              cases: [
                {
                  case: 'a',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [1]
                        }
                      ]
                    }
                  ]
                },
                {
                  case: 'b',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [2]
                        }
                      ]
                    }
                  ]
                },
                {
                  case: 'c',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [3]
                        }
                      ]
                    },
                    {
                      $use: 'break'
                    }
                  ]
                },
                {
                  case: 'd',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [4]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $use: 'return',
              value: {
                $use: 'getVar',
                path: ['items']
              }
            }
          ]
        },
        { value: 'b' }
      )
      expect(value).toEqual([2, 3])
    })
    test("if no cases match, treat the first item with no case as a default", () => {
      const value = resolver.resolveValue(
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['items'],
              value: []
            },
            {
              $use: 'switch',
              value: {
                $use: 'get',
                path: ['value']
              },
              cases: [
                {
                  case: 'a',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [1]
                        },
                        {
                          $use: 'break'
                        }
                      ]
                    }
                  ]
                },
                {
                  case: 'b',
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [2]
                        },
                        {
                          $use: 'break'
                        }
                      ]
                    }
                  ]
                },
                {
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [-1]
                        }
                      ]
                    }
                  ]
                },
                {
                  steps: [
                    {
                      $use: 'set',
                      path: [
                        'items',
                        {
                          name: 'push',
                          args: [-2]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $use: 'return',
              value: {
                $use: 'getVar',
                path: ['items']
              }
            }
          ]
        },
        { value: '?' }
      )
      expect(value).toEqual([-1])
    })
  })
})
