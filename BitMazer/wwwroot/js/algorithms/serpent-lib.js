const MAXINT = 0xffffffff;

function rotw(x, n) {
    return ((x << n) | (x >>> (32 - n))) & MAXINT;
}

function getW(buf, i) {
    return buf[i] | (buf[i + 1] << 8) | (buf[i + 2] << 16) | (buf[i + 3] << 24);
}

function setWInv(buf, i, w) {
    buf[i] = w & 0xff;
    buf[i + 1] = (w >>> 8) & 0xff;
    buf[i + 2] = (w >>> 16) & 0xff;
    buf[i + 3] = (w >>> 24) & 0xff;
}

function createSerpent() {
    //
    var keyBytes = null;
    var dataBytes = null;
    var dataOffset = -1;
    //var dataLength    = -1;
    var algorithmName = null;
    // var idx2          = -1;
    //

    algorithmName = "serpent";

    var srpKey = [];

    function srpK(r, a, b, c, d, i) {
        r[a] ^= srpKey[4 * i]; r[b] ^= srpKey[4 * i + 1]; r[c] ^= srpKey[4 * i + 2]; r[d] ^= srpKey[4 * i + 3];
    }

    function srpLK(r, a, b, c, d, e, i) {
        r[a] = rotw(r[a], 13); r[c] = rotw(r[c], 3); r[b] ^= r[a]; r[e] = (r[a] << 3) & MAXINT;
        r[d] ^= r[c]; r[b] ^= r[c]; r[b] = rotw(r[b], 1); r[d] ^= r[e]; r[d] = rotw(r[d], 7); r[e] = r[b];
        r[a] ^= r[b]; r[e] = (r[e] << 7) & MAXINT; r[c] ^= r[d]; r[a] ^= r[d]; r[c] ^= r[e]; r[d] ^= srpKey[4 * i + 3];
        r[b] ^= srpKey[4 * i + 1]; r[a] = rotw(r[a], 5); r[c] = rotw(r[c], 22); r[a] ^= srpKey[4 * i + 0]; r[c] ^= srpKey[4 * i + 2];
    }

    function srpKL(r, a, b, c, d, e, i) {
        r[a] ^= srpKey[4 * i + 0]; r[b] ^= srpKey[4 * i + 1]; r[c] ^= srpKey[4 * i + 2]; r[d] ^= srpKey[4 * i + 3];
        r[a] = rotw(r[a], 27); r[c] = rotw(r[c], 10); r[e] = r[b]; r[c] ^= r[d]; r[a] ^= r[d]; r[e] = (r[e] << 7) & MAXINT;
        r[a] ^= r[b]; r[b] = rotw(r[b], 31); r[c] ^= r[e]; r[d] = rotw(r[d], 25); r[e] = (r[a] << 3) & MAXINT;
        r[b] ^= r[a]; r[d] ^= r[e]; r[a] = rotw(r[a], 19); r[b] ^= r[c]; r[d] ^= r[c]; r[c] = rotw(r[c], 29);
    }

    var srpS = [
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x3]; r[x3] |= r[x0]; r[x0] ^= r[x4]; r[x4] ^= r[x2]; r[x4] = ~r[x4]; r[x3] ^= r[x1];
            r[x1] &= r[x0]; r[x1] ^= r[x4]; r[x2] ^= r[x0]; r[x0] ^= r[x3]; r[x4] |= r[x0]; r[x0] ^= r[x2];
            r[x2] &= r[x1]; r[x3] ^= r[x2]; r[x1] = ~r[x1]; r[x2] ^= r[x4]; r[x1] ^= r[x2];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x1]; r[x1] ^= r[x0]; r[x0] ^= r[x3]; r[x3] = ~r[x3]; r[x4] &= r[x1]; r[x0] |= r[x1];
            r[x3] ^= r[x2]; r[x0] ^= r[x3]; r[x1] ^= r[x3]; r[x3] ^= r[x4]; r[x1] |= r[x4]; r[x4] ^= r[x2];
            r[x2] &= r[x0]; r[x2] ^= r[x1]; r[x1] |= r[x0]; r[x0] = ~r[x0]; r[x0] ^= r[x2]; r[x4] ^= r[x1];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x3] = ~r[x3]; r[x1] ^= r[x0]; r[x4] = r[x0]; r[x0] &= r[x2]; r[x0] ^= r[x3]; r[x3] |= r[x4];
            r[x2] ^= r[x1]; r[x3] ^= r[x1]; r[x1] &= r[x0]; r[x0] ^= r[x2]; r[x2] &= r[x3]; r[x3] |= r[x1];
            r[x0] = ~r[x0]; r[x3] ^= r[x0]; r[x4] ^= r[x0]; r[x0] ^= r[x2]; r[x1] |= r[x2];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x1]; r[x1] ^= r[x3]; r[x3] |= r[x0]; r[x4] &= r[x0]; r[x0] ^= r[x2]; r[x2] ^= r[x1]; r[x1] &= r[x3];
            r[x2] ^= r[x3]; r[x0] |= r[x4]; r[x4] ^= r[x3]; r[x1] ^= r[x0]; r[x0] &= r[x3]; r[x3] &= r[x4];
            r[x3] ^= r[x2]; r[x4] |= r[x1]; r[x2] &= r[x1]; r[x4] ^= r[x3]; r[x0] ^= r[x3]; r[x3] ^= r[x2];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x3]; r[x3] &= r[x0]; r[x0] ^= r[x4]; r[x3] ^= r[x2]; r[x2] |= r[x4]; r[x0] ^= r[x1];
            r[x4] ^= r[x3]; r[x2] |= r[x0]; r[x2] ^= r[x1]; r[x1] &= r[x0]; r[x1] ^= r[x4]; r[x4] &= r[x2];
            r[x2] ^= r[x3]; r[x4] ^= r[x0]; r[x3] |= r[x1]; r[x1] = ~r[x1]; r[x3] ^= r[x0];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x1]; r[x1] |= r[x0]; r[x2] ^= r[x1]; r[x3] = ~r[x3]; r[x4] ^= r[x0]; r[x0] ^= r[x2];
            r[x1] &= r[x4]; r[x4] |= r[x3]; r[x4] ^= r[x0]; r[x0] &= r[x3]; r[x1] ^= r[x3]; r[x3] ^= r[x2];
            r[x0] ^= r[x1]; r[x2] &= r[x4]; r[x1] ^= r[x2]; r[x2] &= r[x0]; r[x3] ^= r[x2];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x1]; r[x3] ^= r[x0]; r[x1] ^= r[x2]; r[x2] ^= r[x0]; r[x0] &= r[x3]; r[x1] |= r[x3];
            r[x4] = ~r[x4]; r[x0] ^= r[x1]; r[x1] ^= r[x2]; r[x3] ^= r[x4]; r[x4] ^= r[x0]; r[x2] &= r[x0];
            r[x4] ^= r[x1]; r[x2] ^= r[x3]; r[x3] &= r[x1]; r[x3] ^= r[x0]; r[x1] ^= r[x2];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x1] = ~r[x1]; r[x4] = r[x1]; r[x0] = ~r[x0]; r[x1] &= r[x2]; r[x1] ^= r[x3]; r[x3] |= r[x4]; r[x4] ^= r[x2];
            r[x2] ^= r[x3]; r[x3] ^= r[x0]; r[x0] |= r[x1]; r[x2] &= r[x0]; r[x0] ^= r[x4]; r[x4] ^= r[x3];
            r[x3] &= r[x0]; r[x4] ^= r[x1]; r[x2] ^= r[x4]; r[x3] ^= r[x1]; r[x4] |= r[x0]; r[x4] ^= r[x1];
        }];

    var srpSI = [
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x3]; r[x1] ^= r[x0]; r[x3] |= r[x1]; r[x4] ^= r[x1]; r[x0] = ~r[x0]; r[x2] ^= r[x3];
            r[x3] ^= r[x0]; r[x0] &= r[x1]; r[x0] ^= r[x2]; r[x2] &= r[x3]; r[x3] ^= r[x4]; r[x2] ^= r[x3];
            r[x1] ^= r[x3]; r[x3] &= r[x0]; r[x1] ^= r[x0]; r[x0] ^= r[x2]; r[x4] ^= r[x3];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x1] ^= r[x3]; r[x4] = r[x0]; r[x0] ^= r[x2]; r[x2] = ~r[x2]; r[x4] |= r[x1]; r[x4] ^= r[x3];
            r[x3] &= r[x1]; r[x1] ^= r[x2]; r[x2] &= r[x4]; r[x4] ^= r[x1]; r[x1] |= r[x3]; r[x3] ^= r[x0];
            r[x2] ^= r[x0]; r[x0] |= r[x4]; r[x2] ^= r[x4]; r[x1] ^= r[x0]; r[x4] ^= r[x1];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x2] ^= r[x1]; r[x4] = r[x3]; r[x3] = ~r[x3]; r[x3] |= r[x2]; r[x2] ^= r[x4]; r[x4] ^= r[x0];
            r[x3] ^= r[x1]; r[x1] |= r[x2]; r[x2] ^= r[x0]; r[x1] ^= r[x4]; r[x4] |= r[x3]; r[x2] ^= r[x3];
            r[x4] ^= r[x2]; r[x2] &= r[x1]; r[x2] ^= r[x3]; r[x3] ^= r[x4]; r[x4] ^= r[x0];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x2] ^= r[x1]; r[x4] = r[x1]; r[x1] &= r[x2]; r[x1] ^= r[x0]; r[x0] |= r[x4]; r[x4] ^= r[x3];
            r[x0] ^= r[x3]; r[x3] |= r[x1]; r[x1] ^= r[x2]; r[x1] ^= r[x3]; r[x0] ^= r[x2]; r[x2] ^= r[x3];
            r[x3] &= r[x1]; r[x1] ^= r[x0]; r[x0] &= r[x2]; r[x4] ^= r[x3]; r[x3] ^= r[x0]; r[x0] ^= r[x1];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x2] ^= r[x3]; r[x4] = r[x0]; r[x0] &= r[x1]; r[x0] ^= r[x2]; r[x2] |= r[x3]; r[x4] = ~r[x4];
            r[x1] ^= r[x0]; r[x0] ^= r[x2]; r[x2] &= r[x4]; r[x2] ^= r[x0]; r[x0] |= r[x4]; r[x0] ^= r[x3];
            r[x3] &= r[x2]; r[x4] ^= r[x3]; r[x3] ^= r[x1]; r[x1] &= r[x0]; r[x4] ^= r[x1]; r[x0] ^= r[x3];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x1]; r[x1] |= r[x2]; r[x2] ^= r[x4]; r[x1] ^= r[x3]; r[x3] &= r[x4]; r[x2] ^= r[x3]; r[x3] |= r[x0];
            r[x0] = ~r[x0]; r[x3] ^= r[x2]; r[x2] |= r[x0]; r[x4] ^= r[x1]; r[x2] ^= r[x4]; r[x4] &= r[x0]; r[x0] ^= r[x1];
            r[x1] ^= r[x3]; r[x0] &= r[x2]; r[x2] ^= r[x3]; r[x0] ^= r[x2]; r[x2] ^= r[x4]; r[x4] ^= r[x3];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x0] ^= r[x2]; r[x4] = r[x0]; r[x0] &= r[x3]; r[x2] ^= r[x3]; r[x0] ^= r[x2]; r[x3] ^= r[x1];
            r[x2] |= r[x4]; r[x2] ^= r[x3]; r[x3] &= r[x0]; r[x0] = ~r[x0]; r[x3] ^= r[x1]; r[x1] &= r[x2];
            r[x4] ^= r[x0]; r[x3] ^= r[x4]; r[x4] ^= r[x2]; r[x0] ^= r[x1]; r[x2] ^= r[x0];
        },
        function (r, x0, x1, x2, x3, x4) {
            r[x4] = r[x3]; r[x3] &= r[x0]; r[x0] ^= r[x2]; r[x2] |= r[x4]; r[x4] ^= r[x1]; r[x0] = ~r[x0]; r[x1] |= r[x3];
            r[x4] ^= r[x0]; r[x0] &= r[x2]; r[x0] ^= r[x1]; r[x1] &= r[x2]; r[x3] ^= r[x2]; r[x4] ^= r[x3];
            r[x2] &= r[x3]; r[x3] |= r[x0]; r[x1] ^= r[x4]; r[x3] ^= r[x4]; r[x4] &= r[x0]; r[x4] ^= r[x2];
        }];

    var srpKc = [7788, 63716, 84032, 7891, 78949, 25146, 28835, 67288, 84032, 40055, 7361, 1940, 77639, 27525, 24193, 75702,
        7361, 35413, 83150, 82383, 58619, 48468, 18242, 66861, 83150, 69667, 7788, 31552, 40054, 23222, 52496, 57565, 7788, 63716];
    var srpEc = [44255, 61867, 45034, 52496, 73087, 56255, 43827, 41448, 18242, 1939, 18581, 56255, 64584, 31097, 26469,
        77728, 77639, 4216, 64585, 31097, 66861, 78949, 58006, 59943, 49676, 78950, 5512, 78949, 27525, 52496, 18670, 76143];
    var srpDc = [44255, 60896, 28835, 1837, 1057, 4216, 18242, 77301, 47399, 53992, 1939, 1940, 66420, 39172, 78950,
        45917, 82383, 7450, 67288, 26469, 83149, 57565, 66419, 47400, 58006, 44254, 18581, 18228, 33048, 45034, 66508, 7449];

    function srpInit(key) {
        keyBytes = key;
        var i, j, m, n;
        function keyIt(a, b, c, d, i) { srpKey[i] = r[b] = rotw(srpKey[a] ^ r[b] ^ r[c] ^ r[d] ^ 0x9e3779b9 ^ i, 11); }
        function keyLoad(a, b, c, d, i) { r[a] = srpKey[i]; r[b] = srpKey[i + 1]; r[c] = srpKey[i + 2]; r[d] = srpKey[i + 3]; }
        function keyStore(a, b, c, d, i) { srpKey[i] = r[a]; srpKey[i + 1] = r[b]; srpKey[i + 2] = r[c]; srpKey[i + 3] = r[d]; }

        keyBytes.reverse();
        keyBytes[keyBytes.length] = 1; while (keyBytes.length < 32) keyBytes[keyBytes.length] = 0;
        for (i = 0; i < 8; i++) {
            srpKey[i] = (keyBytes[4 * i + 0] & 0xff) | (keyBytes[4 * i + 1] & 0xff) << 8 |
                (keyBytes[4 * i + 2] & 0xff) << 16 | (keyBytes[4 * i + 3] & 0xff) << 24;
        }

        var r = [srpKey[3], srpKey[4], srpKey[5], srpKey[6], srpKey[7]];

        i = 0; j = 0;
        while (keyIt(j++, 0, 4, 2, i++), keyIt(j++, 1, 0, 3, i++), i < 132) {
            keyIt(j++, 2, 1, 4, i++); if (i == 8) { j = 0; }
            keyIt(j++, 3, 2, 0, i++); keyIt(j++, 4, 3, 1, i++);
        }

        i = 128; j = 3; n = 0;
        while (m = srpKc[n++], srpS[j++ % 8](r, m % 5, m % 7, m % 11, m % 13, m % 17), m = srpKc[n], keyStore(m % 5, m % 7, m % 11, m % 13, i), i > 0) {
            i -= 4; keyLoad(m % 5, m % 7, m % 11, m % 13, i);
        }
    }

    function srpClose() {
        srpKey = [];
    }

    function srpEncrypt(data, offset) {
        dataBytes = data;
        dataOffset = offset;
        var blk = dataBytes.slice(dataOffset, dataOffset + 16); blk.reverse();
        var r = [getW(blk, 0), getW(blk, 4), getW(blk, 8), getW(blk, 12)];

        srpK(r, 0, 1, 2, 3, 0);
        var n = 0, m = srpEc[n];
        while (srpS[n % 8](r, m % 5, m % 7, m % 11, m % 13, m % 17), n < 31) { m = srpEc[++n]; srpLK(r, m % 5, m % 7, m % 11, m % 13, m % 17, n); }
        srpK(r, 0, 1, 2, 3, 32);

        for (var j = 3; j >= 0; j--, dataOffset += 4) setWInv(dataBytes, dataOffset, r[j]);
    }

    function srpDecrypt(data, offset) {
        dataBytes = data;
        dataOffset = offset;
        var blk = dataBytes.slice(dataOffset, dataOffset + 16); blk.reverse();
        var r = [getW(blk, 0), getW(blk, 4), getW(blk, 8), getW(blk, 12)];

        srpK(r, 0, 1, 2, 3, 32);
        var n = 0, m = srpDc[n];
        while (srpSI[7 - n % 8](r, m % 5, m % 7, m % 11, m % 13, m % 17), n < 31) { m = srpDc[++n]; srpKL(r, m % 5, m % 7, m % 11, m % 13, m % 17, 32 - n); }
        srpK(r, 2, 3, 1, 4, 0);

        setWInv(dataBytes, dataOffset, r[4]); setWInv(dataBytes, dataOffset + 4, r[1]); setWInv(dataBytes, dataOffset + 8, r[3]); setWInv(dataBytes, dataOffset + 12, r[2]);
        dataOffset += 16;
    }

    return {
        name: "serpent",
        blocksize: 128 / 8,
        open: srpInit,
        close: srpClose,
        encrypt: srpEncrypt,
        decrypt: srpDecrypt
    };
}

export { createSerpent };