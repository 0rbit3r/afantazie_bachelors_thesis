$aux_dir = 'tmp';
$pdf_mode = 4;

# If your TeX environment does not provide working LuaLaTeX, uncomment this:
#$pdf_mode = 1;

ensure_path('TEXINPUTS', 'tex//:');
