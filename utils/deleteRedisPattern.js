import { client } from "../config/redis.client.config.js";

// * Redis does not natively support deleting keys with a wildcard pattern directly (like news:*),
// * so this function uses the SCAN command to find keys matching the pattern and deletes them.
export const deleteRedisPattern = async (pattern) => {
  let cursor = "0";
  do {
    const [newCursor, keys] = await client.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );
    cursor = newCursor;
    if (keys.length > 0) {
      await client.del(keys);
    }
  } while (cursor != "0");
};

/**
 * Function Breakdown:

    cursor = "0";
        This initializes the Redis cursor to 0, which signifies the start of the scan operation. The cursor is used for iterating over the Redis keyspace.

    do {...} while (cursor != "0");
        The SCAN command is cursor-based, meaning it can return a partial set of results and a new cursor for continuing the scan. The loop runs until the cursor returns to 0, which signifies that all keys have been scanned.

    await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        client.scan: This sends a SCAN command to Redis, which iterates over keys in the database.
        MATCH: Specifies the pattern to match keys against (e.g., news:*).
        COUNT: Suggests the number of keys to return in each batch (here, 100). Note that COUNT is not a hard limit—Redis may return fewer keys.
        Result: Returns:
            newCursor: The cursor for the next iteration.
            keys: An array of keys matching the pattern in this batch.

    if (keys.length > 0) { await client.del(keys); }
        If the scan returns any keys:
            client.del(keys): Deletes all the matched keys in bulk. Redis supports deleting multiple keys at once by passing an array of keys.

    Update cursor:
        The newCursor value is assigned to cursor for the next iteration.
        If the new cursor is 0, the loop ends because the scan has covered all keys.
 */
