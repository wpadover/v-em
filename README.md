v-em
====

Virtual Emrick: The NHL Game Report Play by Play Parser

===

v-em is a library that parses [NHL Play by Play Game Reports](http://www.nhl.com/scores/htmlreports/20122013/PL020423.HTM) to turn the events into something that a program can read. It came out of the desire to find a free NHL API to provide statistics, ultimately unsuccessfully.

v-em will turn read these play by play reports and output them in a standardized JSON format. These JSON outputs can then be read by any JSON parsing library and your app can do with it what you wish (put it into a database, transform it, aggregate it, etc.).

===

### Usage

Coming soon

===

### Future Work

Eventually v-em will start up a simple server to serve these JSON reports as a true API, to make this truly language agnostic and avoid needing the extra step to parse.
