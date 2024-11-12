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
            default: Show the feed in the full character set

       matrix --hex
            hexadecimal: some operators find this more comfortable

       matrix --ascii
            only latin characters: for monolingual americans

       matrix --binary
            raw binary feed: most suitable for droids

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

       D    Default full charset
       A    ASCII
       N/J  Nihongo (Japanese)
       H    Hexadecimal
       B    Binary
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
