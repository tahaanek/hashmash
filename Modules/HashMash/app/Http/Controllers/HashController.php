<?php

namespace Modules\HashMash\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class HashController extends Controller
{
    protected array $algorithms = [
        'md5'       => 'MD5',
        'sha1'      => 'SHA1',
        'sha224'    => 'SHA224',
        'sha256'    => 'SHA256',
        'sha384'    => 'SHA384',
        'sha512'    => 'SHA512',
        'crc32'     => 'CRC32',
        'crc32b'    => 'CRC32B',
        'ripemd160' => 'RIPEMD-160',
    ];

    public function algorithms()
    {
        return response()->json([
            'algorithms' => $this->algorithms,
        ]);
    }

    public function hash(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        $hashes = [];

        foreach (array_keys($this->algorithms) as $algo) {
            $hashes[$algo] = hash($algo, $validated['text']);
        }

        return response()->json([
            'hashes' => $hashes,
        ]);
    }
}
