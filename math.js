// Generate all symbols

const mainGenerateSymbolImage = (img, width, height, res) => {

    const getValue = (i, j) => {
        if(i < 0 || i >= width || j < 0 || j >= height){
            return 0;
        }
        return img[i][j];
    }

    const generateSymbolImage = (left, right, top, bottom) => {
        const FULLSIZE = 100
        const MARGIN = 10
        const SIZE = 80
        const w = right - left + 1
        const h = bottom - top + 1
        const symbolImage = []

        for(let i = 0 ; i < FULLSIZE; i++){
            const tmp = []
            for(let j = 0; j < FULLSIZE; j++){
                tmp.push(1)
            }
            symbolImage.push(tmp)
        }

        for(let i = 0; i < SIZE; i++){
            for(let j = 0; j < SIZE; j++){
                const i0 = left + Math.floor(w*i/SIZE)
                const j0 = top + Math.floor(h*j/SIZE)
                let pixValue = 0.0
                pixValue += 1.0 / 4 * getValue(i0, j0)
                pixValue += 1.0 / 8 * getValue(i0-1, j0)
                pixValue += 1.0 / 8 * getValue(i0+1, j0)
                pixValue += 1.0 / 8 * getValue(i0, j0-1)
                pixValue += 1.0 / 8 * getValue(i0, j0+1)
                pixValue += 1.0 / 16 * getValue(i0-1, j0-1)
                pixValue += 1.0 / 16 * getValue(i0-1, j0+1)
                pixValue += 1.0 / 16 * getValue(i0+1, j0-1)
                pixValue += 1.0 / 16 * getValue(i0+1, j0+1)

                symbolImage[MARGIN+i][MARGIN+j] = Math.round(pixValue)
            }
        }

        let str = ""
        for(let i = 0 ; i < FULLSIZE; i++){
            for(let j = 0; j < FULLSIZE; j++){
                str += symbolImage[i][j]
            }
            str += "\n"
        }
        console.log(str)
        return symbolImage
    }


    for(let i = 0; i < res.length; i++){
        generateSymbolImage(res[i].l, res[i].r, res[i].t, res[i].b)
    }
}

const collectConnectedComponents = (imgArr, w, h, min_cell) => {
    const queue = [];
    const check = {};
    const x = [-1, -1, -1, 0, 0, 1, 1, 1];
    const y = [-1, 0, 1, -1, 1, -1, 0, 1];

    const result = []
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            const res = {}
            if (!check[i + "-" + j] && !imgArr[i][j]) {
                queue.push({ x: i, y: j });
                res.l = res.r = i
                res.t = res.b = j
                let num = 0

                while (queue.length) {
                    check[i + "-" + j] = 1;
                    const it = queue[0];
                    queue.shift();
                    num ++ ;
                    res.l = Math.min(it.x, res.l);
                    res.r = Math.max(it.x, res.r);
                    res.t = Math.min(it.y, res.t);
                    res.b = Math.max(it.y, res.b);
                    for (let k = 0; k < 8; k++) {
                        const a = it.x + x[k];
                        const b = it.y + y[k];
                        if ( 0 <= a && a < w && 0 <= b && b < h && !imgArr[a][b] && !check[a + "-" + b] ) {
                            queue.push({ x: a, y: b });
                            check[a + "-" + b] = 1;
                        }
                    }
                }
                if( num >= min_cell)
                    result.push(res)
            }
        }
    }

    mainGenerateSymbolImage(imgArr, w, h, result)

    return Promise.resolve()
};

export const uploadImageToStatistic = (data, SIZE) => {
    const data_length = Object.keys(data).length;
    const GrayImage = [];
    for (let i = 0; i < data_length; i += 4) {
        const gray =
            (data[i] + data[i + 1] + data[i + 2]) / 3;
        GrayImage.push(gray);
    }

    const res = [];
    let tmp = [];
    let num = 0;
    for (let i in GrayImage) {
        num++;
        tmp.push(GrayImage[i]);
        if (num == SIZE) {
            num = 0;
            res.push(tmp);
            tmp = [];
        }
    }

    for( let i = 0; i < SIZE / 4; i += SIZE / 4) {
        for ( let j = 0;j < SIZE;j += SIZE / 4) {
            const hist = [];
            for ( let k = 0; k < 32; k++)
                hist.push(1);
            for ( let x = i; x < i + SIZE / 4; x++) {
                for ( let y = j; y < j + SIZE / 4; y++) {
                    hist[parseInt(res[x][y] / 8)] += 1;
                }
            }

            const histR = [];
            for( let k = 1; k < 32; k++) {
                histR.push(
                    hist[k] /
                        hist[k - 1]
                );
            }

            let mx = -1;
            let mx_index = 12;
            for( let k = 0; k < 31; k++) {
                if (
                    mx < histR[k] &&
                    hist[k + 1] >= 100
                ) {
                    mx = histR[k];
                    mx_index = k;
                }
            }

            for (let k = mx_index; k >= 0; k--) {
                if (histR[k] < 3.0) {
                    mx_index = k + 1;
                    break;
                }
            }

            for (let x = i; x < i + SIZE / 4; x++) {
                for (let y = j; y < j + SIZE / 4; y++) {
                    res[x][y] = res[x][y] < mx_index * 8 ? 0 : 1;
                }
            }
        }
    }

    let str = "\n";
    for ( let i = 0; i < SIZE / 4; i += 2) {
        for ( let j = 0; j < SIZE; j += 2) {
            str = str + res[i][j];
        }
        str = str + "\n";
    }
    console.log(str)
    return collectConnectedComponents(res, SIZE/4, SIZE, 10)
}
