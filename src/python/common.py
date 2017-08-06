'''
This module does most of the code processing to allow the execution of
a Python program.

The names defined here will be included in the globals namespace in which
the user's program is executed.  We try to avoid names collisions by
almost always using a double underscore as a prefix.
'''
import sys
from browser import window, console

REEBORG_EN = {}
exec("from reeborg_en import *", REEBORG_EN)
REEBORG_FR = {}
exec("from reeborg_fr import *", REEBORG_FR)

def import_en(namespace):
    '''Does the clean equivalent of
           from reeborg_en import *
       into a namespace.
    '''
    ReeborgOK_saved = window['ReeborgOK_en']
    ReeborgOk_saved = window['ReeborgOk_en']
    ReeborgError_saved = window['ReeborgError_en']
    WallCollisionError_saved = window['WallCollisionError_en']
    MissingObjectError_saved = window['MissingObjectError_en']

    namespace.update(REEBORG_EN)

    window['ReeborgOK'] = ReeborgOK_saved
    window['ReeborgOk'] = ReeborgOk_saved
    window['ReeborgError'] = ReeborgError_saved
    window['WallCollisionError'] = WallCollisionError_saved
    window['MissingObjectError'] = MissingObjectError_saved

def import_fr(namespace):
    '''Does the clean equivalent of
           from reeborg_fr import *
       into a namespace.
    '''
    ReeborgOK_saved = window['ReeborgOK_fr']
    ReeborgOk_saved = window['ReeborgOk_fr']
    ReeborgError_saved = window['ReeborgError_fr']
    WallCollisionError_saved = window['WallCollisionError_fr']
    MissingObjectError_saved = window['MissingObjectError_fr']

    namespace.update(REEBORG_FR)

    window['ReeborgOK'] = ReeborgOK_saved
    window['ReeborgOk'] = ReeborgOk_saved
    window['ReeborgError'] = ReeborgError_saved
    window['WallCollisionError'] = WallCollisionError_saved
    window['MissingObjectError'] = MissingObjectError_saved

def __add_watch(expr):
    window.RUR.watched_expressions.append(expr)

window.RUR.add_watch = __add_watch


def __write(data):
    window.RUR.output.write(str(data))


def __write_err(data):
    window.RUR.output._write("<b style='color:red'>" + str(data) + "</b>")

def __html_escape(obj):
    return str(obj).replace("&", "&amp").replace("<", "&lt;").replace(">", "&gt;")


__old_vars = "<span class='watch_name'>%s:</span> <span class='watch_value'>%s</span>"  # NOQA
__new_vars = "<span class='changed_name'>%s:</span> <span class='changed_value'>%s</span>"  # NOQA
__changed_vars = "<span class='watch_name'>%s:</span> <span class='changed_value'>%s</span>"  # NOQA
__html_div = "<div>%s</div>"
__watch_title = "<span class='watch_title'>%s</span>"
__previous_watch_values = {}


def __append_watch(arg, value, out):
    global __previous_watch_values
    if arg not in __previous_watch_values:
        out.append(__html_div % (__new_vars % (arg, value)))
    elif value != __previous_watch_values[arg]:
        out.append(__html_div % (__changed_vars % (arg, value)))
    else:
        out.append(__html_div % (__old_vars % (arg, value)))


def __watch(default, loc=None, gl=None):
    global __previous_watch_values
    ignore = ['system_default_vars', 'line_info']
    current_watch_values = {}
    if loc is None:
        loc = {}
    if gl is None:
        gl = {}
    out = []
    no_new_local = True
    for arg in loc:
        if arg in default or arg in ignore:
            continue
        else:
            if no_new_local:
                no_new_local = False
                out.append(__watch_title % window.RUR.translate("Local variables"))
            value = __html_escape(loc[arg])
            current_watch_values[arg] = value
        __append_watch(arg, value, out)

    no_new_global = True
    for arg in gl:
        if arg in default or arg in ignore:
            continue
        else:
            if no_new_global:
                no_new_global = False
                if not no_new_local:
                    out.append("")
                out.append(__watch_title % window.RUR.translate("Global variables"))
            value = __html_escape(gl[arg])
            current_watch_values[arg] = value
        __append_watch(arg, value, out)

    no_new_expr = True
    for arg in window.RUR.watched_expressions:
        if no_new_expr:
            no_new_expr = False
            out.append(__watch_title % window.RUR.translate("Watched expressions"))
        try:
            value = __html_escape(eval(arg, gl, loc))
        except Exception as e:
            value = repr(e)
        current_watch_values[arg] = value
        __append_watch(arg, value, out)

    window.RUR.output.watch_variables("".join(out))
    __previous_watch_values = current_watch_values


def __default_help():
    '''Lists available commands'''
    exclude = ["toString", "window", "RUR", "say", "face_au_nord", "narration"]
    lang = window.RUR.state.human_language
    if lang in ['en', 'fr_en', 'ko_en']:
        import reeborg_en  # NOQA
        reeborg_en.dir_py = dir_py
        dir_py(reeborg_en, exclude=exclude)
    elif lang in ['fr', 'en_fr']:
        import reeborg_fr  # NOQA
        reeborg_fr.dir_py = dir_py
        dir_py(reeborg_fr, exclude=exclude)
    else:
        print("Unrecognized language; please file an issue!")


#TODO: use textwrap.dedent to improve format of help.

def __help(obj=None):
    '''Usage: help(obj)'''   # yes: without the double underscore!!
    out = []
    if obj is None:
        __default_help()
        return
    try:
        out.append("<h2>{}</h2>".format(obj.__name__))
        if hasattr(obj, "__doc__"):
            doc = "<pre>{}</pre>".format(str(obj.__doc__))
            out.append(doc)
        else:
            out.append("<p>No docstring found.</p>")
    except Exception as e:
        window.console.log("exception in __help", e.__name__)

    for attr in dir(obj):
        if attr == "__class__" or attr.startswith("__"):
            continue
        try:
            if hasattr(getattr(obj, attr), "__doc__"):
                if getattr(obj, attr).__doc__:
                    out.append("<h3>{}</h3>".format(attr))
                    doc = "<pre>{}</pre>".format(getattr(obj, attr).__doc__)
                    out.append(doc)
        except AttributeError:
            pass
    if not out:
        raise AttributeError("This object has no docstring.")
    else:
        window.print_html("".join(out), True)
window["__help"] = __help


def generic_translate_python(src, highlight=False, var_watch=False, pre_code='',
                             post_code=''):
    ''' RUR.translate Python code into Javascript and execute

        src: source code in editor
        highlight: determines if the code will be highlighted as it is run
        var_watch: determines if some variable watch will take place
        pre_code: code included with world definition and prepended to user code
        post_code: code included with world definition and appended to user code
    '''
    from preprocess import transform # keeping out of global namespace
    from highlight import insert_highlight_info
    sys.stdout.write = __write
    sys.stderr.write = __write_err

    # reeborg_en and reeborg_fr define some attributes to window; these
    # could have been redefined when importing a different language version -
    # or, perhas even when running a Javascript version; so it
    # is important to ensure that they have their proper definition by forcing
    # a fresh import each time such a request is made via something like
    #     from reeborg_en import *
    # Similarly, library or biblio's content might have changed by the user
    # since the program was run last time
    for mod in ["reeborg_en", "reeborg_fr", "library", "biblio", "extra"]:
        if mod in sys.modules:
            del sys.modules[mod]

    globals_ = {}
    globals_.update(globals())
    globals_['__help'] = __help
    globals_['__watch'] = __watch
    globals_['__previous_watch_values'] = {}

    src = transform(src)
    # sometimes, when copying from documentation displayed in the browsers
    # some nonbreaking spaces are inserted instead of regular spaces.
    # We make the assumption that nonbreaking spaces should never appear
    # in source code - which is not necessarily valid...
    if '\xa0' in src:
        src = src.replace('\xa0', ' ')
        window.console.warn("Some nonbreaking spaces were replaced in the Python code.")

    # Notwithstanding what is writte above regarding fresh imports,
    # we simulate this here by doing a dict update, thus effectively using a
    # cached version of a previous import  while ensuring that and
    # global ("window") definition is done properly.
    if window.RUR.from_import == "from reeborg_en import *":
        globals_.update(REEBORG_EN)
    elif window.RUR.from_import == "from reeborg_fr import *":
        globals_.update(REEBORG_FR)
    else:
        raise Exception("unknown import %s" % window.RUR.from_import)

    if highlight or var_watch:
        try:
            temp_src, problem = insert_highlight_info(src, highlight=highlight,
                                                      var_watch=var_watch)
            if not problem:
                src = temp_src
            else:
                window.RUR.toggle_highlight()
                window.jQuery("#highlight-impossible").show()
        except Exception as e:
            window.RUR.__python_error = e
            window.console.log("problem with hightlight:", e)
            return
    if hasattr(window.RUR, "__debug"):
        window.console.log("processed source:")
        window.console.log(src)

    if var_watch:
        system_vars = "system_default_vars = set(locals().keys())\n"
    else:
        system_vars = "\n"
    src = "help=__help\n" + pre_code + "\n" + system_vars + src + "\n" + post_code
    try:
        exec(src, globals_)
    except Exception as e:
        window.RUR.__python_error = e
