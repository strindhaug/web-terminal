export interface ManPageData {
    title: string
    text: string
    command: string
}

const manpage_matrix_text = `
NAME
    matrix - watch the raw feed of The Matrix

SYNOPSIS
    matrix
        With no options this will emulate the look of the movie
        as closely as possible with mirrored katakana and numbers.

    matrix [-abfghjnu]
        See the OPTIONS section for details and
        alternate option syntax with long option names.

DESCRIPTION
    Because the matrix feed is very dense this terminal only shows a
    tiny slice of the full feed in order to not overwhelm the
    operator. This program uses a heuristic to filter out and show
    only the most important streams, and it will suppress most
    "blips" (inline code mutations) that it deems irrelevant to the
    current mission.

    But the operator may of course change the agressiveness of the
    heuristic to show more or less information at once as needed with
    these controls.

COMMANDS
    These are the command inputs that are available during execution

    INFORMATION SPEED CONTROLS:

    Q           Quit, disconnect from the feed and return to terminal
    P           pause feed
    R           resume feed
    SPACE       step through feed while paused

    Up arrow    More simultaneous feeds
    Down arrow  Fewer simultaneous feeds
    Right arrow More blips
    Left arrow  Fewer blips


    ENCODING CONTROLS:
    (See descriptions of the various encodings in the OPTIONS section below)

    A    ASCII
    F    Full Base256 charset
    N/J  Nihongo (Japanese)
    U    Ukraine
    H    Hexadecimal
    B    Binary
    G    Glitch

    D    Default movie charset
    M    Toggle letter mirroring




OPTIONS
    These are the command line options available. All these options can
    be changed during runtime with the commands above.
    (no options)
        Original "The Matrix" encoding with a small set of mirrored half
        width katakana characters (and one kanji) and arabic numerals and
        the letter Z and ç and some punctuation.

    -f  or  --full
        Full encoding: uses a character set consisting of several symbols
        letters and numbers mainly from Latin scripts and Japanese. Note
        the symbols themselves are actually not meaningful, it's just
        arbitrary symbols chosen by the Japanese developers as symbols in
        a Base256 encoding.

    -h  or  --hex
        hexadecimal: Use hexadecimal character encoding. Some older
        operators tend to find this more comfortable

    -b  or --binary
        Binary encoding. Most suitable for androids.

    -a  or  --ascii  or  --american
        Use only ASCII characters (i.e. latin letters and numbers and
        symbols). Preferred by monolingual Americans.

    -n  or  --nihongo
        Use only japanese characters (and arabic numerals).
        Interestingly also preferred by some other monolingual Americans.
        Some say not being able to read the characters help them focus,
        others just think it looks cool.

    -j  or  --japanese
        Alias for -n

    -u  or  --ukraine
        Ukraine cyrillic

    -g  or  --glitch
        Glitchy

`

const manPages: { [key: string]: ManPageData } = {
    matrix: {
        title: "Matrix Data Stream Viewer",
        command: "MATRIX(1)",
        text: manpage_matrix_text,
    },
}

export function getManPage(command: string): ManPageData | undefined {
    return manPages[command]
}

const file1 = `1
2
3
4
5
6
7
8
9
10 ------------- This is 80 cols ----------------------------------------------|
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25 ----------------------------------------------------------------------------|
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60

This is the end
my friend
`

export async function getFile(_filename: string) {
    return file1
}
