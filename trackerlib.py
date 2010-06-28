# Make sure we have a module for doing shell scripts and one for simple web forms.
import os
import cgi
import re

# This function can probably be beautified
def parseRawLog(svnLog):
    """Parses a raw svn log.
    
    Returns a list with entries, each list item containing a dictionary with
    two keys; info (string) and changes (list)
    """
    logList = cgi.escape(svnLog.read()).splitlines()
    entries = []
    current = 0
    separator = "-" * 72
    for i, line in enumerate(logList): 
        if line != separator:
            # After the separator comes the log info
            if logList[i - 1] == separator:
                entries.append({"info": line, "changes": []})
            elif line:
                entries[current]["changes"].append(line)
            
            # If next list item is a separator, there are no more changes
            if logList[i + 1] == separator:
                current += 1
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
    for line in logInfo:
        if line.startswith("["):
            for c in line:
                if c in mapping:
                    classes.append(mapping[c])
                if c == "]":
                    if (not classes) or (len(classes) == 1 and classes[0] == "editorial"):
                        classes.append("none")
                if c == ")":
                    break
            changes.append(line.split(") ", 1)[-1])
        else:
            changes.append(line)
    return {"changes": changes, "classes": classes}


def getRevisionData(revision):
    revInfo = revision["info"] # This is the info line for a revision
    revChanges = parseLogLine(revision["changes"]) # Changes for the revision

    iconClasses = ["authors", "conformance-checkers", "gecko", "internet-explorer", "opera", "webkit", "google-gears", "tools"]
    titleClasses = ["editorial", "draft-content", "stable-draft", "implemented", "stable"]

    # Get the revision number
    number = getNumber(revInfo, 1)
    # Get the revision date and chop off the seconds and time zone
    date = re.split(" \(", re.split(" \| ", revInfo)[2])[0][:16]

    # Get stuff from the changes line(s)
    # TODO: fix the classAttr and titleAttr to only return if non-empty
    classAttr = " class=\"%s\"" % " ".join(revChanges["classes"])
    titleAttr = " title=\"%s\"" % ", ".join([title.replace("-", " ").title() for title in revChanges["classes"] if title in titleClasses])
    icons = "".join([("<img src=\"icons/%s\" alt=\"[%s]\"> ") % (class_, class_.replace("-", " ").title()) for class_ in revChanges["classes"] if class_ in iconClasses])
    changes = "<br>".join(revChanges["changes"])

    # TODO: Implement the source stuff to work with links
    link = "?from=%s&amp;to=%s" % (str(toInt(number) - 1), number)

    return {
        "number": number,
        "link": link,
        "classAttr": classAttr,
        "titleAttr": titleAttr,
        "icons": icons,
        "changes": changes,
        "date": date
        }


def formatLog(logList):
    output = ""
    if logList:
        output += "<table id=\"log\">\n   <tr>" \
            "<th><abbr title=\"Revision\">R</abbr></th>" \
            "<th>Comment</th>" \
            "<th>Time (UTC)</th></tr>"
        for revision in logList:
            revData = getRevisionData(revision)
            output += "\n   <tr%(classAttr)s%(titleAttr)s>" \
                "<td>%(number)s</td>" \
                "<td><a href=\"%(link)s\">%(icons)s%(changes)s</a></td>" \
                "<td>%(date)s</td></tr>" % revData
        output += "\n  </table>"
    return output


def formatDiff(diff):
    """Takes a svn diff and marks it up with elements for styling purposes
    
    Returns a formatted diff
    """
    diff = diff.splitlines()
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

def getDiffCommand(source, revFrom, revTo):
    command = "svn diff -r %s%s %s"
    if revTo:
        return command % (revFrom, ":%s" % revTo, source)
    else:
        return command % (revFrom, "", source)

def getLogCommand(source, revFrom, revTo):
    revFrom += 1
    return "svn log %s -r %s:%s" % (source, revFrom, revTo)

def getDiff(source, revFrom, revTo, identifier):
    if identifier == "":
        identifier = "html5"
    filename = identifier + "-" + str(revFrom) + "-" + str(revTo)

    # Specialcase revTo 0 so future revFrom=c&revTo=0 still show the latest
    if revTo != 0 and os.path.exists("diffs/" + filename):
        return open("diffs/" + filename, "r").read()
    else:
        diff = cgi.escape(os.popen(getDiffCommand(source, revFrom, revTo)).read())
        if not diff:
            return diff

        # Specialcase revTo 0 so future revFrom=c&revTo=0 still show the
        # latest
        if revTo == 0:
            filename = identifier + "-" + str(revFrom) + "-" + str(getNumber(diff, 2))
            
            # Return early if we already have this diff stored
            if os.path.exists("diffs/" + filename):
                return diff

        # Store the diff
        file = open("diffs/" + filename, "w")
        file.write(diff)
        file.close()
        return diff

def getNumber(s, n):
    return int(re.split("\D+", s)[n])


def toInt(s):
    return int(float(s))


def startFormatting(title, identifier, source):
    document = """Content-Type:text/html;charset=UTF-8

<!doctype html>
<html lang="en">
 <head>
  <meta name="robots" content="index, nofollow">
  <title>%s Revision Tracker</title>
  <link rel=icon href="http://www.whatwg.org/images/icon">
  <style>
   html { background:#fff; color:#000; font:1em/1 Arial, sans-serif }
   form { margin:1em 0; font-size:.7em }
   form[hidden] { display:none }            except:
                 revTo = 0
   fieldset { margin:0; padding:0; border:0 }
   legend { padding:0; font-weight:bold }
   form p { margin:0 }
   input[type=number] { width:4.5em }
   table#log { border-collapse:collapse }
   table#log td { padding:.1em .5em }
   table#log td:first-child + td + td { white-space:nowrap }
   img { font-size:xx-small }

   .draft-content { background-color:#eee; }
   .stable-draft { background-color:#fcc; }
   .implemented { background-color:#f99; }
   .stable { background-color:#f66; }
   body .editorial { color:gray; }

   :link { background-color:transparent; color:#00f; }
   :visited { background-color:transparent; color:#066; }
   img { border-style:none; vertical-align:middle; }

   td :link { color:inherit; }
   td a { text-decoration:none; display:block; }
   td a:hover { text-decoration:underline; }

   /* filter */
   .editorial tr.editorial,
   .editorial li.editorial,
   .hidden { display:none; }
   
   #diff { display: table; white-space: normal }
   #diff samp samp { display: block; white-space: pre; margin: 0 }
   #diff .deletion { background: #fdd; color: #900 }
   #diff .addition { background: #dfd; color: #000 }
   #diff .line-info { background: #eee; color: #000 }
  </style>
  <script>
   function createCookie(name,value,days) {
    var expires = ""
    if(days) {
     var date = new Date()
     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
     expires = "; expires=" + date.toGMTString()
    }
    document.cookie = "%s"+name+"="+value+expires+"; path=/"
   }
   function readCookie(name) {
    name = "%s"+name+"="
    var ca = document.cookie.split(';')
    for(var i=0; i < ca.length; i++) {
     var c = ca[i]
     while(c.charAt(0)==' ')
      c = c.substring(1,c.length)
     if(c.indexOf(name) == 0)
      return c.substring(name.length,c.length)
    }
    return null;
   }
   function getFieldValue(idName) { return document.getElementById(idName).value }
   function setFieldValue(idName, n) { document.getElementById(idName).value = n }
   function setFrom(n) {
    createCookie('from', n, 30)
    setFieldValue('from', n)
    setFieldValue('to', '')
   }

   // for pre javascript 1.6 browsers
   if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(el, start) {
     var start = start || 0;
     for (var i = 0; i < this.length; ++i) {
      if (this[i] === el) {
       return i;
      }
     }
     return -1;
    }
   }
   function addClass(elm, className) {
    var reg = new RegExp('(^| )'+ className +'($| )');
    if (!reg.test(elm.className))
     elm.className += " "+className;
   }
   function removeClass(elm, className) {
    elm.className = elm.className.replace(new RegExp("(^|\\\s+)" + className + "($|\\\s+)", "g"), " ");
   }
   var affects = ["authors", "conformance-checkers", "gecko", "internet-explorer", "opera", "webkit", "google-gears", "tools", "none"];
   var stability = ["draft-content", "stable-draft", "implemented", "stable"]; // not editorial
   window.onload = function() {
    var form = document.forms[1];
    var log = document.getElementById("log");
    if (log.tagName == "TABLE") {
     var rows = log.getElementsByTagName("tr");
     var firstRow = 1;
    } else {
     var rows = log.getElementsByTagName("li");
     var firstRow = 0;
    }
    var rowsLen = rows.length;
    
    // make sure all checkboxes are checked (in case of reload)
    for(var i = 1, len = form.elements.length; i < len; ++i) {
     form.elements[i].checked = true;
    }
    function updateFilter(arr, item, bool) {
     if (arr.indexOf(item) != -1 && !bool)
      arr.splice(arr.indexOf(item), 1);
     else
      arr.push(item);
    }
    function updateTable() {
     var affectsLen = affects.length;
     var stabilityLen = stability.length;
     for (var i = firstRow; i < rowsLen; ++i) {
      var affectMatches = false;
      var stabilityMatches = false;
      var row = rows[i];
      var rowClasses = row.className.split(" ");
      for (var j = 0; j < affectsLen; ++j) {
       
       if (rowClasses.indexOf(affects[j]) != -1)
        affectMatches = true;
      }
      for (var k = 0; k < stabilityLen; ++k) {
       if (rowClasses.indexOf(stability[k]) != -1)
        stabilityMatches = true;
      }
      if (affectMatches && stabilityMatches)
       removeClass(row, "hidden"); 
      else
       addClass(row, "hidden");
     }
    }
    form.onchange = function(e) {
     var target = e.target;
     if(target.type != "checkbox") return;
     if(target.name == "editorial") {
      if(target.checked)
       removeClass(document.body, target.name);
      else
       addClass(document.body, target.name);
     } else {
      var tokens = target.name.split("_");
      if (tokens[0] == "affects")
       updateFilter(affects, tokens[1], target.checked);
      else
       updateFilter(stability, tokens[1], target.checked);
      updateTable();
     }
    }
   }
  </script>
 </head>
 <body>
  <h1>%s Revision Tracker</h1>
  <form>
   <fieldset>
    <legend>Diff</legend>
    <label>From: <input id=from type=number min=1 value="%s" name=from required></label>
    <label>To: <input id=to type=number min=0 value="%s" name=to></label> (omit for latest revision)
    <input type="submit" value="Generate diff">
   </fieldset>
  </form>
  <form%s>
   <fieldset>
    <legend>Filter</legend>
    <!--
    <p>Affects:
     <label><input type=checkbox name=affects_authors checked> <img src="icons/authors" alt=""> Authors</label>
     <label><input type=checkbox name=affects_conformance-checkers checked> <img src="icons/conformance-checkers" alt=""> Validators</label>
     <label><input type=checkbox name=affects_gecko checked> <img src="icons/gecko" alt=""> Gecko</label>
     <label><input type=checkbox name=affects_internet-explorer checked> <img src="icons/internet-explorer" alt=""> IE</label>
     <label><input type=checkbox name=affects_opera checked> <img src="icons/opera" alt=""> Opera</label>
     <label><input type=checkbox name=affects_webkit checked> <img src="icons/webkit" alt=""> WebKit</label>
     <label><input type=checkbox name=affects_google-gears checked> <img src="icons/google-gears" alt=""> Gears</label>
     <label><input type=checkbox name=affects_tools checked> <img src="icons/tools" alt=""> Tools</label>
     <label><input type=checkbox name=affects_none checked> None</label>
    <p>Stability:
     <label class=draft-content><input type=checkbox name=stability_draft-content checked> Draft content</label>
     <label class=stable-draft><input type=checkbox name=stability_stable-draft checked> Stable draft</label>
     <label class=implemented><input type=checkbox name=stability_implemented checked> Implemented</label>
     <label class=stable><input type=checkbox name=stability_stable checked> Stable</label>
    -->
    <label class=editorial>Show editorial changes <input type=checkbox name=editorial checked></label>
   </fieldset>
  </form>
  <script>
   if(getFieldValue('from') == "" && readCookie('from') != null)
    setFrom(readCookie('from'))
  </script>
  %s
 </body>
</html>"""
    showDiff = False
    revFrom = 290 # basically ignored, but sometimes a useful fiction for debugging
    revTo = 0
    os.environ["TZ"] = "" # Set time zone to UTC. Kinda hacky, but works :-)
    form = cgi.FieldStorage()

    if "from" in form:
        try:
            revFrom = toInt(form["from"].value)
            showDiff = True
        except:
            pass

    if showDiff and "to" in form:
        try:
            revTo = toInt(form["to"].value)
            if 0 < revTo < revFrom:
                revFrom, revTo = revTo, revFrom
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
            limit = " --limit 100"
            try:
                limit = " --limit %s" % toInt(form["limit"].value)
            except:
                pass
        svnLog = os.popen("svn log %s%s" % (source, limit))
        parsedLog = parseRawLog(svnLog)
        formattedLog = formatLog(parsedLog)
        print document % (title, identifier, identifier, title, "", "", "", formattedLog)
    else:
        #
        # DIFF
        #
        diff = formatDiff(getDiff(source, revFrom, revTo, identifier))
        try:
            # This fails if there is no diff -- hack
            revTo = getNumber(diff, 2)
            svnLog = os.popen(getLogCommand(source, revFrom, revTo))
            parsedLog = parseRawLog(svnLog)
            formattedLog = formatLog(parsedLog)
            result = """%s
  <pre id="diff"><samp>%s</samp></pre>
  <p><a href="?from=%s&amp;to=%s" rel=prev>Previous</a> | <a href="?from=%s&amp;to=%s" rel=next>Next</a>
  <p><input type="button" value="Prefill From field for next time!" onclick="setFrom(%s)">""" % (formattedLog, diff, revFrom-1, revFrom, revTo, revTo+1, revTo)
            print document % (title, identifier, identifier, title, revFrom, revTo, " hidden", result)
        except:
            print document % (title, identifier, identifier, title, revFrom, "", " hidden", "No result.")

