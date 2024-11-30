## NOTES

- Static methods and properties in a class can be used directly with the class itself, without creating an instance or object of the class. They are tied to the class, not to any particular instance.

  ```
  class Utility {
  static add(a, b) {
      return a + b;
  }
  }

  console.log(Utility.add(3, 7)); // Output: 10

  // No need for this:
  const util = new Utility();
  console.log(util.add(3, 7)); // Not necessary
  ```

- In JavaScript/TypeScript, when defining methods in a class, you do not use the function keyword.
