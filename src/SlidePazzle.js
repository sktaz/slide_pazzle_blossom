/* 
/slide_puzzle/src/SlidePazzle.js
*/

import React, { useState, useEffect } from 'react'
import defaultImage from './chihiro020.jpg'


const SlidePazzle = () => {
    /* base64エンコードした正解の画像を格納する　**/
    const [seikaiImage, setSeikaiImage] = useState(null)

    /** タイル画像を入れる配列 */
    const [tileImageList, setTileImageList] = useState([])     // https://deniz.co/8-puzzle-solver/ 最短12step


    /** 成功メッセージ */
    const [message, setMessage] = useState(null)



    /** クリックした画像 */
    let clickedTile

    /** ドラッグした先 */
    let toTile

    /** ドラッグした回数 */
    let sumCount = 0

    /** 正解の画像を取得する */
    useEffect(() => {
        // <canvas>要素を生成
        const canvasElem = document.createElement('canvas')
        // <canvas>のサイズを設定
        canvasElem.width = 390
        canvasElem.height = 390
        // 2Dグラフィックを描画するためのメソッドやプロパティをもつオブジェクトを取得
        const ctx = canvasElem.getContext('2d')

        // 新たな<img>要素を作成
        const imageObj = new Image()
        // img要素のソースのパスを設定  イメージ: <img src="defaultImage">
        imageObj.src = defaultImage

        imageObj.onload = () => {
            // defaultImageを390×390で描画する
            ctx.drawImage(imageObj, 0, 0, 390, 390)
            // 画像をbase64エンコード
            const encodedDefaultImage = canvasElem.toDataURL()
            // seikaiImageにエンコード後の値を設定する
            setSeikaiImage(encodedDefaultImage)
        }
    }, [])


    /** タイル画像を生成する */
    useEffect(() => {
        if (!seikaiImage) return

        // <canvas>要素を生成
        const canvas = document.createElement('canvas')
        // <canvas>のサイズを設定
        canvas.width = 130
        canvas.height = 130

        // 2Dグラフィックを描画するためのメソッドやプロパティをもつオブジェクトを取得
        const ctx = canvas.getContext('2d')

        // 新たな<img>要素を作成
        const img = new Image()
        // img要素のソースのパスを設定  イメージ: <img src="defaultImage">
        img.src = seikaiImage


        img.onload = async () => {
            // 130px × 130pxで描画する用の設定を格納した配列を作成
            // 補足: canvas内の390×390内のうち、○番目の画像はxとy軸のどこに描画するかという設定を定義する
            // ctx.drawImage(img, 描画を始めるx座標, 描画を始めるy座標, 元の画像の描画使用範囲幅, 元の画像の描画使用範囲高さ, 0, 0, 描画する幅, 描画する幅)
            const imageConfigureList = [
                {
                    orderNum: 1, // 画像の順番
                    customFunc: () => ctx.drawImage(img, 0, 0, 130, 130, 0, 0, 130, 130) // 画像をどの位置で描画するかの関数呼び出し
                },
                {
                    orderNum: 2,
                    customFunc: () => ctx.drawImage(img, 130, 0, 130, 130, 0, 0, 130, 130)
                },
                {
                    orderNum: 3,
                    customFunc: () => ctx.drawImage(img, 260, 0, 130, 130, 0, 0, 130, 130)
                },

                {
                    orderNum: 4,
                    customFunc: () => ctx.drawImage(img, 0, 130, 130, 130, 0, 0, 130, 130)
                },
                {
                    orderNum: 5,
                    customFunc: () => ctx.drawImage(img, 130, 130, 130, 130, 0, 0, 130, 130)
                },
                {
                    orderNum: 6,
                    customFunc: () => ctx.drawImage(img, 260, 130, 130, 130, 0, 0, 130, 130)
                },

                {
                    orderNum: 7,
                    customFunc: () => ctx.drawImage(img, 0, 260, 130, 130, 0, 0, 130, 130)
                },
                {
                    orderNum: 8,
                    customFunc: () => ctx.drawImage(img, 130, 260, 130, 130, 0, 0, 130, 130)
                },
                {
                    orderNum: 9,
                    customFunc: () => ''
                }
            ]


            // 画像を表示する順番List
            const displayOrder = [1, 8, 2, 7, 4, 3, 6, 5, 9]

            // 130×130の画像を格納する配列
            const list = []

            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    // 画像を表示する順番Listの値を左から取り出していく
                    const selectedNum = displayOrder.shift()
                    const configure = imageConfigureList.find((imageConfigure) => {
                        return imageConfigure.orderNum == selectedNum
                    })


                    // 番号が9番目の場合はblankタイルを設定する    
                    if (selectedNum == 9) {
                        list.push({
                            id: row.toString() + '-' + col.toString(),
                            src: `${window.location.origin}/blank_tile.png`,
                            orderNum: selectedNum
                        })
                    } else
                    // それ以外は130pxで描画した画像を設定する
                    {
                        // jsonオブジェクトの項目として設定していたcustomFunc関数を呼び出し画像を描画
                        configure.customFunc()

                        // 画像をbase64エンコード
                        const encodedImage = canvas.toDataURL()

                        // 配列に{:id, :src, :orderNum}を格納
                        list.push({
                            id: row.toString() + '-' + col.toString(),
                            src: encodedImage,
                            orderNum: selectedNum
                        })
                    }
                }
            }

            // 画像が入った配列を取得 [{:id, :src, :orderNum}]
            const items = await Promise.all(list)
            setTileImageList(items)
        }
    }, [seikaiImage])


    /** タイル画像のドラッグを検知できるようにイベントリスナーを追加 */
    useEffect(() => {
        if (tileImageList.length != 9) return

        const tile00 = document.getElementById('0-0')
        const tile01 = document.getElementById('0-1')
        const tile02 = document.getElementById('0-2')

        const tile10 = document.getElementById('1-0')
        const tile11 = document.getElementById('1-1')
        const tile12 = document.getElementById('1-2')

        const tile20 = document.getElementById('2-0')
        const tile21 = document.getElementById('2-1')
        const tile22 = document.getElementById('2-2')

        const list = [tile00, tile01, tile02, tile10, tile11, tile12, tile20, tile21, tile22]

        list.map((item) => {
            if (item) {
                item.addEventListener('dragstart', dragStart)

                item.addEventListener('dragover', dragOver)
                item.addEventListener('dragenter', dragEnter)
                item.addEventListener('dragleave', dragLeave)

                item.addEventListener('drop', dragDrop)
                item.addEventListener('dragend', dragEnd)
            }
        })
    }, [tileImageList])

    /** dragStart時に呼び出す関数 */
    const dragStart = (event) => {
        clickedTile = event.target // クリックしてドラッグしようとした画像を取得
    }

    /** dragOver時に呼び出す関数 */
    const dragOver = (event) => {
        event.preventDefault()
    }

    /** dragEnter時に呼び出す関数 */
    const dragEnter = (event) => {
        event.preventDefault()
    }

    /** dragLeave時に呼び出す関数 */
    const dragLeave = (event) => {
        event.preventDefault()
    }

    /** dragDrop時に呼び出す関数 */
    const dragDrop = (event) => {
        toTile = event.target // ドラッグ先の画像を取得
    }

    /** dragEnd時に呼び出す関数 */
    const dragEnd = () => {
        // ドラッグ先がblankでなければreturn
        // 補足:blank画像以外にdropさせないようにするための処理
        if (!toTile.getAttribute('src').includes('blank')) {
            return
        }


        // 上・下・右・左にしか動かせないように設定
        // 補足: 斜めに画像をドラッグ&ドロップできないようにするための処理
        const currCoords = clickedTile.id.split('-') // "0-0" -> ["0", "0"]
        const row = parseInt(currCoords[0])
        const col = parseInt(currCoords[1])

        const toCoords = toTile.id.split('-')
        const row2 = parseInt(toCoords[0])
        const col2 = parseInt(toCoords[1])

        const moveLeft = row == row2 && col2 == col - 1
        const moveRight = row == row2 && col2 == col + 1

        const moveUp = col == col2 && row2 == row - 1
        const moveDown = col == col2 && row2 == row + 1

        const isMovable = moveLeft || moveRight || moveUp || moveDown

        if (isMovable) {
            // imageの入れ替え
            const currImg = clickedTile.src
            const otherImg = toTile.src

            clickedTile.src = otherImg
            toTile.src = currImg

            // numの入れ替え(numは正解にたどりついたかの判定に利用するため、入れかえを行う)
            const currNum = clickedTile.getAttribute('num')
            const otherNum = toTile.getAttribute('num')
            clickedTile.setAttribute('num', otherNum)
            toTile.setAttribute('num', currNum)

            sumCount = sumCount + 1
            document.getElementById('sumCount').innerText = sumCount
        }

        /** 正解したかどうかチェックする */
        checkResult()
    }




    /** 正解したかチェックする関数 */
    const checkResult = () => {
        const tile00 = document.getElementById('0-0')
        const tile01 = document.getElementById('0-1')
        const tile02 = document.getElementById('0-2')

        const tile10 = document.getElementById('1-0')
        const tile11 = document.getElementById('1-1')
        const tile12 = document.getElementById('1-2')

        const tile20 = document.getElementById('2-0')
        const tile21 = document.getElementById('2-1')
        const tile22 = document.getElementById('2-2')

        const list = [tile00, tile01, tile02, tile10, tile11, tile12, tile20, tile21, tile22]


        // elemetの項目numの値が1~9に並んだら正解判定する
        const isCorrect = list.every((item, index) => {
            return item.getAttribute('num') == index + 1
        })

        if (isCorrect && !message) {
            setMessage(`正解です！ ${sumCount}回で正解`)
            list.map((item, index) => {
                if (item) {
                    item.removeEventListener('dragstart', dragStart)

                    item.removeEventListener('dragover', dragOver)
                    item.removeEventListener('dragenter', dragEnter)
                    item.removeEventListener('dragleave', dragLeave)

                    item.removeEventListener('drop', dragDrop)
                    item.removeEventListener('dragend', dragEnd)
                }
            })
        } else {
            setMessage('')
        }
    }


    return (
        <>
            <div class="content">
                <div className="content__head">
                    <h1>スライドパズル</h1>
                </div>
                <div className='content__main'>
                    <div className='content__block'>
                        <h3>問題</h3>
                        <div className="content__frame">
                            {tileImageList.map((item, index) => {
                                return (
                                    <img className='puzzle_image'
                                        key={`image_${index}`}
                                        id={item.id}
                                        src={item?.src}
                                        num={item?.orderNum}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    <div className='content__block'>
                        <h3>正解の画像</h3>
                        <div className="content__frame">
                            {seikaiImage ? <img className="" src={seikaiImage}></img> : <></>}
                        </div>
                    </div>
                </div>
                <div className='content__footer'>

                    <h1>{message}</h1>
                    <span>動かした回数: </span>
                    <span id="sumCount" className="">
                        {sumCount}
                    </span>
                </div>
            </div>

        </>
    )
}

export default SlidePazzle