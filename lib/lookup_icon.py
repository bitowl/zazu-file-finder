# Small script to look up icons correctly using pygtk
import sys
import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk
icon = Gtk.IconTheme.get_default().lookup_icon(sys.argv[1], 64, 0)

if icon is None:
    print('fa-file')
else:
    print(icon.get_filename())
