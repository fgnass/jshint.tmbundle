on run argv
	set window_name to item 1 of argv
	try
		tell application "TextMate" to close window named window_name
	on error number -1728
	end try
end run