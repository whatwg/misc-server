#!/usr/bin/env python

# Make sure we have a module for doing shell scripts and one for simple web forms.
import os
import cgi
import re
import urllib

# This function can probably be beautified
def parseRawLog(log):
    """Parses a log.

    Returns a list with entries, each list item containing a dictionary with
    two keys; info (string) and changes (list)
    """
    logList = cgi.escape(log.read()).splitlines()
    entries = []
    current = 0
    for i, line in enumerate(logList):
        if line.startswith("git-svn-id: "):
            if entries[-1]["current"] == current:
                entries[current]["info"] = line
                current += 1
            continue

        if line == "":
            continue

        if len(entries) == current:
            entries.append({"info": "", "date":line, "changes": [], "current": current})
        else:
            entries[current]["changes"].append(line)
    return entries


def parseLogLine(logInfo):
    mapping = {
        "e": "editorial",
        "a": "authors",
        "c": "conformance-checkers",
        "g": "gecko",
        "i": "internet-explorer",
        "o": "opera",
        "w": "webkit",
        "r": "google-gears",
        "t": "tools",
        "0": "draft-content",
        "1": "stable-draft",
        "2": "implemented",
        "3": "stable"
        }
    changes = []
    classes = []
    bug = None
    for line in logInfo:
        if line.startswith("Fixing http://www.w3.org/Bugs/Public/show_bug.cgi?id="):
            bug = line[53:]
        elif line.startswith("Fixing https://www.w3.org/Bugs/Public/show_bug.cgi?id="):
            bug = line[54:]
        elif line.startswith("["):
            for c in line:
                if c in mapping:
                    classes.append(mapping[c])
                if c == "]":
                    if (not classes) or (len(classes) == 1 and classes[0] == "editorial"):
                        classes.append("none")
                if c == ")":
                    break
            changes.append(line.split(") ", 1)[-1])
        elif line.startswith("Affected topics:"):
            pass
        else:
            changes.append(line)
    return {"changes": changes, "classes": classes, "bug": bug}


def getRevisionData(revision):
    # get the revision number
    number = getNumber(revision["info"], 1)

    # parse revision changes
    revChanges = parseLogLine(revision["changes"])

    iconClasses = ["authors", "conformance-checkers", "gecko", "internet-explorer", "opera", "webkit", "google-gears", "tools"]
    titleClasses = ["editorial", "draft-content", "stable-draft", "implemented", "stable"]

    # Get stuff from the changes line(s)
    # TODO: fix the classAttr and titleAttr to only return if non-empty
    classAttr = " class=\"%s\"" % " ".join(revChanges["classes"])
    titleAttr = " title=\"%s\"" % ", ".join([title.replace("-", " ").title() for title in revChanges["classes"] if title in titleClasses])
    icons = "".join([("<img src=\"icons/%s\" alt=\"[%s]\"> ") % (class_, class_.replace("-", " ").title()) for class_ in revChanges["classes"] if class_ in iconClasses])
    changes = "<br>".join(revChanges["changes"])

    # TODO: Implement the source stuff to work with links
    link = "?from=%s" % (str(toInt(number) - 1))

    bug = ""
    if revChanges["bug"]:
        bug = "<a href=\"https://www.w3.org/Bugs/Public/show_bug.cgi?id=" + revChanges["bug"] + "\">" + revChanges["bug"] + "</a>"

    return {
        "number": number,
        "link": link,
        "classAttr": classAttr,
        "titleAttr": titleAttr,
        "icons": icons,
        "changes": changes,
        "date": revision["date"][:16],
        "bug" : bug
        }


def formatLog(logList):
    output = ""
    if logList:
        output += "<table id=\"log\">\n   <tr>" \
            "<th>SVN</th>" \
            "<th>Bug</th>" \
            "<th>Comment</th>" \
            "<th>Time (UTC)</th></tr>"
        for revision in logList:
            revData = getRevisionData(revision)
            output += "\n   <tr%(classAttr)s%(titleAttr)s>" \
                "<td>%(number)s</td>" \
                "<td>%(bug)s</td>" \
                "<td><a href=\"%(link)s\">%(icons)s%(changes)s</a></td>" \
                "<td>%(date)s</td></tr>" % revData
        output += "\n  </table>"
    return output


def formatDiff(diff):
    """Takes a diff and marks it up with elements for styling purposes

    Returns a formatted diff
    """
    diff = diff.splitlines()[4:]
    diffList = []

    def formatLine(line):
        format = "<samp class=\"%s\">%s</samp>"
        formattingTypes = {"+": "addition", "-": "deletion", "@": "line-info"}
        diffType = line[0]
        if diffType in formattingTypes.keys():
            diffList.append(format % (formattingTypes[diffType], line))
        else:
            diffList.append("<samp>%s</samp>" % line)

    for line in diff:
        formatLine(line)

    return "\n".join(diffList)


def getNumber(s, n):
    return int(re.split("\D+", s)[n])

def toInt(s):
    return int(float(s))


def startFormatting(title, url, bugzillaComponent):
    document = """Content-Type:text/html;charset=UTF-8

<!doctype html>
<html lang=en>
 <head>
  <title>%s Tracker</title>
  <style>
   html { background:#fff; color:#000; font:1em/1 Arial, sans-serif }
   body { margin:1em 1em 3em }
   form { margin:1em 0; font-size:.7em }
   fieldset { margin:0; padding:0; border:0 }
   legend { padding:0; font-weight:bold }
   input[type=number] { width:4.5em }
   table { border-collapse:collapse }
   table td { padding:.1em .5em }
   table td:last-child { white-space:nowrap }
   img { font-size:xx-small }

   .draft-content { background-color:#eee }
   .stable-draft { background-color:#fcc }
   .implemented { background-color:#f99 }
   .stable { background-color:#f66 }
   body .editorial { color:gray }

   :link { background:transparent; color:#00f }
   :visited { background:transparent; color:#066 }
   img { border:0; vertical-align:middle }

   td :link { color:inherit }
   td a { text-decoration:none; display:block }
   td a:hover { text-decoration:underline }

   .editorial tr.editorial { display:none }

   pre { display:table; white-space:normal }
   samp samp { margin:0; display:block; white-space:pre }
   .deletion { background:#fdd; color:#900 }
   .addition { background:#dfd; color:#000 }
   .line-info { background:#eee; color:#000 }
  </style>
  <script>
   function setCookie(name,value) { localStorage["tracker-" + name] = value }
   function readCookie(name) { return localStorage["tracker-" + name] }
   function setFieldValue(idName, n) { document.getElementById(idName).value = n }
   function getFieldValue(idName) { return document.getElementById(idName).value }
   function setFrom(n) {
     setCookie("from", n)
     setFieldValue("from", n)
     setFieldValue("to", "")
   }

   function showEdits() { return document.getElementById("editorial").checked }
   function updateEditorial() {
     var editorial = showEdits() ? "" : "editorial"
     setCookie("editorial", editorial)
     document.body.className = editorial
   }
  </script>
 </head>
 <body>
  <h1>%s</h1>
  <form>
   <fieldset>
    <legend>Diff</legend>
    <label>SVN: <input id=from type=number min=1 value="%s" name=from required></label>
    <input type=submit value="Generate diff">
   </fieldset>
  </form>
  <form>
   <fieldset>
    <legend>Filter</legend>
    <label class="editorial">Show editorial changes <input type="checkbox" id="editorial" checked="" onchange="updateEditorial()"></label>
   </fieldset>
  </form>
  <script>
   if(getFieldValue("from") == "" && readCookie("from") != null)
     setFrom(readCookie("from"))
   if(readCookie("editorial") == "editorial") {
     document.getElementById("editorial").checked = false
     updateEditorial()
   }
  </script>
  %s
 </body>
</html>"""
    showDiff = False
    revFrom = 8644 # value is ignored, debugging only
    revTo = 8645   # same
    os.environ["TZ"] = "" # Set time zone to UTC. Kinda hacky, but works :-)
    form = cgi.FieldStorage()

    if "from" in form:
        try:
            revFrom = toInt(form["from"].value)
            revTo = revFrom + 1
            showDiff = True
        except:
            pass

    # Put it on the screen
    if not showDiff:
        #
        # HOME
        #
        if "limit" in form and form["limit"].value == "-1":
            limit = ""
        else:
            limit = " -100"
            try:
                limit = "-%s" % toInt(form["limit"].value)
            except:
                pass
        log = formatLog(parseRawLog(os.popen("git --git-dir=./html-mirror/.git log --format=format:%%ci%%n%%B %s" % (limit))))
        print document % (title, title + " Tracker", "", log)
    else:
        #
        # DIFF
        #
        context = "10"
        if "context" in form:
            try:
                context = str(toInt(form["context"].value))
            except:
                pass
        context = "--unified=%s" % context

        gitFrom = os.popen("git --git-dir=html-mirror/.git log --grep='git-svn-id: http://svn.whatwg.org/webapps@%s ' --format=format:%%H" % (revFrom)).read()
        gitTo = os.popen("git --git-dir=html-mirror/.git log --grep='git-svn-id: http://svn.whatwg.org/webapps@%s ' --format=format:%%H" % (revTo)).read()

        log = formatLog(parseRawLog(os.popen("git --git-dir=./html-mirror/.git log --format=format:%%ci%%n%%B %s..%s" % (gitFrom, gitTo))))

        diff = formatDiff(cgi.escape(os.popen("git --git-dir=html-mirror/.git diff %s %s %s -- source" % (gitFrom, gitTo, context)).read()))
        markuptitle = "<a href=" + url + ">" + title + " Tracker" + "</a>"
        bugzillaComponent = urllib.quote(bugzillaComponent, "")
        bugFiler = """<p><a href=https://www.w3.org/Bugs/Public/enter_bug.cgi?product=WHATWG&component=%s>File a bug</a></p>
  <script src=//resources.whatwg.org/file-bug.js async></script>""" % (bugzillaComponent)
        try:
            # This fails if there is no diff -- hack
            result = """%s
  %s
  <pre id="diff"><samp>%s</samp></pre>
  <p><a href=?from=%s rel=prev>Previous</a> | <a href=?from=%s rel=next>Next</a>""" % (bugFiler, log, diff, revFrom-1, revFrom+1)

            # Short URL
            shorturlmarkup = ""
            if title == "HTML Standard":
                shorturl = "http://html5.org/r/"
                if revTo - revFrom == 1:
                    shorturl += str(revTo)
                else:
                    shorturl += str(revFrom) + "-" + str(revTo)
                shorturlmarkup = """<p>Short URL: <code><a href="%s">%s</a></code>\n  """ % (shorturl, shorturl)
            shorturlmarkup += result
            print document % (title, markuptitle, revFrom, shorturlmarkup)
        except:
            print document % (title, markuptitle, revFrom, "No result.")

if __name__ == "__main__":
    startFormatting("HTML Standard", "/tools/web-apps-tracker", "HTML")

