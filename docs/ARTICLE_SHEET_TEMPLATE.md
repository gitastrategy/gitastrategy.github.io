# Article & Blog sheet template

Everything published under **Articles & Blog** comes from one Google Sheet.
Add a row, and the article appears on the website — no rebuild needed.

Sheet: https://docs.google.com/spreadsheets/d/1bYXRX8aThHDZdj0kslXDK-EdzR2-KjXJq4c880Q6Pkg

## Columns (first row = headings, spelled exactly like this)

| Column | Required | What to put in it |
| --- | --- | --- |
| `Title` | Yes | The headline. This also creates the page address. |
| `Date` | Yes | e.g. `04-Sep-2026` |
| `Category` | Yes | e.g. Leadership, Strategy, Ethics |
| `SubCategory` | No | A narrower label |
| `Topic` | No | Short topic tag |
| `Trend` | No | Shown above the headline |
| `Summary` | Yes | 1–2 sentences; used on cards and in search results |
| `Content` | Yes | The full article. Markdown is supported (`## heading`, `**bold**`, lists, links) |
| `ImageUrl` | No | A public image link (https) used as the cover |
| `LinkedInPostURN` | No | Adds a "View on LinkedIn" button |
| `Status` | No | Leave blank or write `published`. Anything else hides the row |
| `PostId` | No | Your own reference id |

## How publishing works

1. Add or edit a row in the sheet.
2. Visitors' browsers read the sheet directly, so most changes show within a few minutes.
3. Every hour the site also copies the sheet into the database, so articles stay
   available even if the sheet is slow or unreachable.
4. To force an immediate copy, open
   `https://gitastrategy.lovable.app/api/public/sync-articles` in a browser tab.

## Tips

- Keep `Title` unique. Two identical titles get numbered addresses (`-2`, `-3`).
- Empty rows are ignored.
- Deleting a row removes it from the live sheet view, but the copied version
  stays in the database until it is replaced — set `Status` to `draft` instead
  of deleting if you want it hidden everywhere.
