# Keyed Value Templates
This library generates values from templates where any special handling is indicated by objects with a specific property name.  In effect, any object with that property is treated as a request to a particular directive matching that property's value.  These directive are objects specially designed to execute such requests, with each type of directive having it's own way of handling said request.

# Quickstart
## Installation
You can install this library though npm like so:
```
$ npm install --save keyed-value-templates
```

## Usage
To use create objects from a template, start by creating a `KeyedTemplateResolver`.  From there, simply use `resolveValue` on the template you want to convert.
```
import { KeyedTemplateResolver } from 'keyed-value-templates'

const resolver = new KeyedTemplateResolver()

const value = resolver.resolveValue({ text: 'Hi' })
```

If passed no parameters, the resolver will simply create a deep clone of the target value.  You can pass in the following optional parameters when you create a resolver:
 - directives: You can pass in a map of string to `KeyedTemplateDirective` objects here.  The resolver will then check the directive id property of a given object against that map when processing said object.  If it finds a directive for that id, it will pass processing the object on to that directive.  This lets you set up special handling for any number of object types, provided you set up a directive for that id.
 - directivesKey: This determines the property the resolver will use to check for directive ids.  By default it uses the `$use` property.
 - localVariablesKey: Some directives will want to reference temporary variables created during template resolution.  This parameter determines what property of the current context those variables are attached to.  By default this uses the `$vars` property.

## Contexts
Calling resolveValue with a single parameter as shown above will resullt in the same value every time.  While this can be useful, one big advantage of templates is their ability to generate different variant of the same result based on provided data.  In this library we do that by passing in a context object as the second parameter, like so:
```
import { KeyedTemplateResolver, DEFAULT_DIRECTIVES } from 'keyed-value-templates'

const resolver = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)

const value = resolver.resolveValue(
  {
    $use: 'get',
    path: ['name']
  },
  {
    name: 'Mario',
    job: 'plumber'
  }
)
```

In that example, the "get" directive uses the provided path to get the name value from the context, resulting in a value of "Mario".  If you plugged in another context it would use that name instead.

### Local Contexts
Some directives make use of what we call a local context.  This is a copy of the provided context, letting those pass on a modified variant of the context for use by their contents.  This is primarily used to attach local variables to a context, using the localVariablesKey mentioned above.

## Directives
We use the `KeyedTemplateDirective` class for objects that provide special template resolution handling for particular marked objects.  The primary feature of these is their `execute` function that handles the actual conversion.  This takes in a parameter object, the target context, and a KeyedTemplateResolver.

You shouldn't need to call this function directly, but the resolver does use this by passing in the object with the matching directive id as the parameters object.  In effect such marked objects both indicate what directive to use and provide the parameters that directive will use to get the target value.

You may have noticed in the Contexts example we used something called DEFAULT_DIRECTIVES.  This is a premade directive map that contains a variety of handy directive keyed to fairly short but readable names.  While you can certainly provide your own directives map, this acts as a handy start point for setting up and using value templates.

We'll go further into the directives that come with this library below.  If you already have robust string parsing library you may want to jump ahead to the String Parsing Directives section to see how to integrate those.

### Lookup Directives
One of the most useful directives in the library is the GetNestedValueDirective.  As the name implies, this uses the provided path to try finding a particular value within a given object.  These directives use the following parameters:
 - source: This cover the object we'll be looking through for the target value.  By default this directive uses the provided context, but you can provide a specific object here if desired.
 - path: This list the steps needed to get to the target value.  If empty or not provided, the directive will just return the source object.
 - default: This is the value the directive will use if either it can't find the target value or that value is undefined.

Note that path parameter doesn't just accept keys and indices.  You can also pass it a PropertyCallRequest consisting of a name string and an arguments list, like this:
```
import { KeyedTemplateResolver, DEFAULT_DIRECTIVES } from 'keyed-value-templates'

const resolver = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)

const value = resolver.resolveValue(
  {
    $use: 'get',
    source: [1, 2, 3],
    path: [
      {
        name: 'join',
        args: ['-']
      }
    ]
  }
)
```

That's useful right out of the box by giving you access to array functions and can become even more so if you provide any utility functions in the context, such as say making the Math object one of it's properties.  However you should avoid using or providing any function that modify the context this way.  The directive does have create a copy of an array before performing any of their functions as a safeguard against this, but other object types currently have no such protection.

Another useful trick you can do is use this directive like a simplified switch statement, like this:
```
import { KeyedTemplateResolver, DEFAULT_DIRECTIVES } from 'keyed-value-templates'

const resolver = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)

const value = resolver.resolveValue(
  {
    $use: 'get',
    source: {
      on: { value: 1 }
      off: { value: 0 }
    },
    path: ['state']
  },
  { state: 'on' }
)
```
Note that while we used simple objects here, each of those source properties could be directives in turn, letting you treat this a branching node that uses a different sub-template depending on the context.

You can also use this directive to get a reference to the context itself.  Using the default directives `{ $use: 'get' }` will do that for you.  You'll rarely need to use that trick directly, but it may be useful if your template contains or calls functions that want such a reference.

Finally, there's a more specialized variant of this directive called the GetLocalVariableDirective.  DEFAULT_DIRECTIVES provide this throught the 'getVar' key.  It operates nearly identically save for 2 factors:
 - It prepends the local variables key to the beginning of the path before executing it, limiting the search to local variables of the current context.
 - It returns the retrieved value directly rather than returning a copy of it.

This combination means not only does it involve a short path, it also allows faster processing as the copy operation is skipped.  As such this is usually a better pick than it's more flexible relative if you know the value you're looking for is a local variable.

### Comparisons
The provided SerialComparisonDirective class lets you compare 2 or more values, returning either a true or false based on whether they meet the comparison's criteria.  The library supports all Javascript's numeric relational operators (ex. less than, greater than, etc..) and equality operators this way using their symbols as keys in DEFAULT_DIRECTIVES.

Each of these directive only uses the "args" parameter.  In most cases you'll only use 2 arguments.  Should you provide more, the directive will perform the comparison on each adjacent pairing, stopping when any comparison fails.  Note that this is functionality equivalent to "compare(1st, 2nd) && compare(2nd, 3rd).."  This can be useful for things like checking if an array's contents are in ascending or descending order.

Another useful comparison directive is the ValueInRangeDirective, listed as "between" in DEFAULT_DIRECTIVES.  Unlike serial comparison directives, this only takes up to 3 values: a minimum (min parameter), a maximum (max parameter), and a value parameter.  The directive will only return true if the value lies between the minimum and maximum.  Note this is an inclusive comparison, so values equal to either endpoint still return true.  Also note that this directive has default values for maximum and minimum and also doesn't ensure the minimum is less than the maximum.  Should you provide a maximum less than the minimum this test will always return false.

### Arithmetic Operators
Much like the above serial comparison directives, this library provides a RepeatedOperationDirective for dealing with paired operation where the result can be fed into the left hand side of the next pair.  All Javascript's arithmetic operators are support this way, with each having their symbols as keys in DEFAULT_DIRECTIVES.  For example, this:
```
const value = resolver.resolveValue(
  {
    $use: '+',
    args: [1, 2, 3]
  }
)
```
Returns the sum of the provided arguments array.

### Logical Operators
All Javascript's binary logical operators are supported using the same RepeatedOperationDirective, with the key difference being they take advantage of the optional checkExitSignal property to break out early is any pairing makes further checks irrelevant.  These are listed as "and", "or", and "coalesce" in DEFAULT_DIRECTIVES.

Negation is also support through the NegationOperatorDirective ("not" in DEFAULT_DIRECTIVES).  Unlike the other operators, this uses the value parameter instead of the args parameter and only processes a single value.

### Conditionals
"If-then" statements are represented by the IfThenDirective ("if" in DEFAULT_DIRECTIVES).  As the name implies, this directive checks the value of it's "if" parameter and if that value resolves to true it will return the resolved value of the provided "then" parameter.  Otherwise, it will return the resolved value for the provided "else" parameter.

As noted above, you can also get similar functionality through a sourced GetNestedValueDirective, nearing the flexibility of a simplified switch statement.  For more advanced switch statements, you'll want to check out the SwitchDirective class, which in turn makes use of the MultiStepDirective class.

### MultiStep Directives
Rather than focusing on returning a specific value, these directives deal with performing other directives in order, much like running a script.  As you might suspect, these sub-directives are taken from the 'steps' parameter.  After each step, the MultiStepDirective checks if the sub-directive's id matches one of it's known exitIds.  If it does, execution stops at that step and the MultiStepDirective returns the sub-directive's value as it's own.

DEFAULT_DIRECTIVES has a good example of this under the 'run' key, using 'return' as it's exit id.  Said 'return' entry is an instance of the ReturnValueDirective class, a type of directive that simply resolves and returns it's value parameter when executed.

Note that these directive run each of their steps within a local cotext.  That initializes and lets you take advantages of local variables for that context.

### Setting Local Variables
The SetLocalValueDirective directive (listed as 'set' in DEFAULT_DIRECTIVES) lets you set the value of a local variable within the current context.  Note that is requires a local context with a corresponding property dedicated to such variables.  Other directives can set this up for you, but it does mean this directive is reliant on others to do that legwork.

The directive uses the 'path' parameter to determine where the value should be assigned and the 'value' parameter to determine what to put there, like so:
```
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
  }
)
```

Note that this directive uses the same pathing as GetLocalVariableDirective does.  That means you can use function calls in the request.  For example:
```
{
  $use: 'set',
  path: [
    'list',
    {
      name: 'push',
      args: ['x']
    }
  ]
}
```

### Loops
One major offshoot of multistep directives is the LoopingDirective class.  On it's own, this class simply adds an exitPriorities map and a runPass function.  The exitPriorities property is a map of directive ids to priority ratings, numeric values that indicate the loop should react to that directive.  The following priorities are currently supported:
 - NONE: This isn't an exit directive.  Proceed normally.
 - BREAK_PASS: Stop the current pass and proceed to the next pass.  Equivalent to the 'continue' statement in Javascript.
 - EXIT_LOOP: Stop both the current pass and further iteration.  Equivalent to the 'break' statement in Javascript.
 - RETURN_VALUE: As EXIT_LOOP, but the directive's value also overrides the loop's normal return value.  Roughly equivalent to the 'return' statement in Javascript.

That priority map gets passed into the directive's constructor, with any ids above priority NONE getting added to the directive's exitIds list.  For it's part, the runPass function works much like runSteps, save that it initializes the directiveId and value of the results and Attaches on of the above priority values to them.  That means you'll get a priority of NONE if the pass finished normally or one of the other values if an exit directive triggered.

A good example of that is the IterationDirective subclass, as seen in the 'forEach' direct of DEFAULT_DIRECTIVES.  That direct iterates over the object or array provided by the passed in 'for' parameter.  Note that you can use another directive to populate that collection, like this:
```
const value = resolver.resolveValue(
  {
    $use: 'run',
    steps: [
    {
      $use: 'set',
      path: ['values'],
      value: []
    },
    {
      $use: 'forEach',
      for: {
        $use: 'get',
        path: ['map']
      },
      steps: [
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
        $use: 'getVar',
        path: ['values']
      }
    }
  },
  {
    map: { a: 1, b: 2}
  }
)
```

You may have noticed that this use the '$value' local variable.  This directive sets that directive before each iteration, as well as either the '$index' variable for arrays or the '$key' variable for objects.

Note that like the MultiStepDirective this normally returns nothing on it's own, though you can send in a 'return' parameter if you want it to do so.  That parameter will only be used if the loop doesn't run into a directive with an associated RETURN_VALUE priority.

The other major type of loop supported right out the box is the RepetitionDirective (listed as 'repeat' in DEFAULT_DIRECTIVES).  This works much like an IterationDirective.  The main difference being instead of using the 'for' parameter to get a target collection it looks for 'from' and 'to' parameters to set a numberic range to iterate over.  Note that both of these default to 1.  That means 'from: 5' with no 'to' would count down to 1 from 5 while 'to: 5' with no 'from' would count up from 1 to 5.  You can also send in 'rate' parameter if you want to cycle through values faster.  This will be forced to a positive absolute value.  For example, -2 would become 2 and 0 would get bumped up to 1.  Note that this loop does maintain an '$index' local variable, but not a '$key' or '$value' variable.

For DEFAULT_DIRECTIVES, both of these loops recognize 'continue', 'break', and 'return' directives that function much like their Javascript counterparts.  Continue is a SignalDirective that's assigned a BREAK_PASS priority by the loops while break is a similar directive that gets assigned the EXIT_LOOP priority.  The return direct is as per the 'run' directive with the RETURN_VALUE priority assigned.

### Switch Directives
Switch statement are significantly trickier than if-then statement or value lookups as they allow for different value duplicating some or all of each other's behavior.  This library tries to mimic that flexibility through the SwitchDirective (listed as 'switch' in DEFAULT_DIRECTIVES).  This directive looks for the 'value' parameter and compares it to everything in the provided 'cases' directive.  Each item in the cases parameter is assumed to have a 'steps' property as per the MultiStepDirective but may also have a 'case' property as well.

When this directive is executed it goes through each case block, becoming active when the block's case value matches the value parameter.  Once active, the directive will execute each step encountered until it runs into an exit directive ('break' and 'return' are supported).

Any block without a case property is treated as a default block.  Each of those fill be ignored during regular processing but should it reach the end of the case list without becoming active it will perform the steps of the first such block.

### Typecasting Directives
The TypeConversionDirective directive provides support for changing values from one type to another.  Listed as 'cast' in DEFAULT_DIRECTIVES, it use the 'value' parameter as the value to be converted and the 'as' directive to determine what it should be converted to.  Note that the 'as' parameter can be an array.  In that case it will skip conversion if the value matches any of those types and apply the first type listed if there's no match.  It's also worth noting that these types include 'array' and 'null' as well as the standard Javascript typeof values.

This conversion is handled by a callback map, where the keys are the type names and the values are functions that convert an unknown value to the target type.  This use DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS for it's default conversions, though you can pass in options to override any of those.

You may notice that 'function' is not on that map.  That's got special default handling to let the directive take advantage of context and template resolver values.  Should the directive be asked to cast to a function with no callback for that it will use an embedded CallbackDirective to do the conversion for it, using the current context and template resolver.

Said CallbackDirective will convert any provided value parameter to a function.  If ask to do so with a resolver and a context, the resulting function will use the resolver to call resolveValue on that parameter using local version of the provided context.  That local context makes the function's arguments available through the '$args' local variable.  If the context and resolver are not provided, the resulting function simply returns the value parameter.

As the name implies, these directives can be used to define callbacks for any function calls made while resolving the template.  A common example would be when you want to use array function like 'find' that use such callbacks.  The 'callback' directive in DEFAULT_DIRECTIVES is an example of this.

### Function Call Directives
Should you want to inject function calls directly into you template, you can do so through the FunctionCallDirective.  When executed, that will call any function provided by the 'target' parameters with any values in the 'args' parameter.  Those arguments do get resolved before being passed in, so you can place other directives in them if you want context dependant arguments.  This is available through DEFAULT_DIRECTIVES as the 'call' directive.

### Literal and Resolve Directives
The LiteralValueDirective lets you skip any directive processing, should you want to preserve said value.  Should you want to crack that protection and resolve those directive requests anyway, you can do so through the ResolveValueDirective.  These are both available through DEFAULT_DIRECTIVES as 'value' and 'resolve' respectively.

### String Parsing Directives
If you have a string parsing library you want to plug into the template resolver, you can do so through the ParseStringDirective.  When executed, that directive will use run the text parameter through it's parseString callback and return the result.

Because it's parser dependent, this directive in not provided by DEFAULT_DIRECTIVES.  Should you want to add one of your own you'll have to create a new ParseStringDirective with the intended parseString callback as the constructor's first parameter.  You may also supply an optimizeTemplate callback as the second parameter.

Here's an example of implementing a string parser using lodash:
```
import {
  KeyedTemplateResolver,
  KeyValueMap,
  ParseStringDirective,
  DEFAULT_DIRECTIVES
} from '../src/index'
import { template } from 'lodash'

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
```

## Template Optimization
In addition to template resolution, the resolver can try to perform template optimization.  This involves stepping through the template and resolving any values that aren't context dependent or otherwise protected.  This can help with things like precalculating values or unpacking commands to populate objects or arrays.  The results of this optimization attempt will be an object with a value property containing the converted template and an 'executable' flag.

This optimization is normally delegated to the directive, with the resolver using whatever the directive's optimizeTemplate returns if that function is present.  Note that those function have the same return type as the resolver does.  When not present it will try to optimize each of the directive's parameters.  Should all of those come back with the executable flag set to true, it will then execute the directive with an empty context.
