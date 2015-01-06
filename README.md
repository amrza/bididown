BidiDown, a bidirectional Markdown editor.

Markdown is a text-to-HTML conversion tool for everyone! you write
your documents in an easy, simple, clean, and human-readable format
(plaintext actually), and Markdown converts them to well-structured
and beautiful HTML documents.

However, to this day, all Markdown goodies was for people who writes
in LTR languages. Markdown itself does not have problem with RTL
inputs but there was no Markdown editor to make it easy for writing
in RTL mode. (Persian, Arabic, Hebrew, Kurdish, ...)

Yes, You can always use `dir=rtl` attribute for your textbox to
achieve this feature, but problem will raise when you want to mix
RTL with LTR (for example trying to put some code inside an RTL
blog post).

Instead of having a complex text editor to support both RTL and LTR,
BidiDown defines seprate blocks for each of them! In other words, we
use multiple tiny textboxes to edit each block. At the end, when you
want to generate actual HTML, we combine these tiny blocks on fly
and send them to "marked.js" (or your markdown engine of choice).

In the process of writing this, i try to use only Vanilla JS for size
and performance. I also have no intention to support ancient browsers.
People who use Markdown for writing documents, probably use modern
browsers too!
