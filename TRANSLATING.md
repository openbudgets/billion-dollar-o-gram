
Steps for adding a translation
------------------------------

The steps to add a new translation involve editing a [template spreadsheet](https://docs.google.com/spreadsheets/d/1PWkjNmJSKPNzkMh4c0xqCYdeLP0MT8TNOMkiYMOPIYw/edit?usp=sharing)

* Determine the translation identifier using the [language]-[country/region]
  syntax, e.g. _pt-BR_. Note the hyphen, don't use underscores! For more detail, see [this
  document](http://www.i18nguy.com/unicode/language-identifiers.html).

* Add the translated titles and texts to the first sheet.
  They should occupy new columns for the title and text (2 for each new language). 
  They **must** be named using the convention
  "title-[code]" and "text-[code]", where [code] is replaced by the language
  identifier set in the step above. E.g. "title-de-DE", without brackets or
  quotation marks.

* Add the necessary fields to the **Extra** sheet. These are:
  * Title and subtitle for the viz
  * Decimal and thousands separators; for cases where a space is used, write "space".
  * Translation for "millions", as well as its abbreviated form.
