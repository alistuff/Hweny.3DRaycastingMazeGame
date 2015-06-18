LevelCreator
用于转换位图地图到javascript数组

关卡地图用位图描述
每个像素表示不同的地形信息

由于不同浏览器渲染位图可能颜色会出现偏差，获取到的每个像素值不一定是编辑时设定的像素，以至于解析地图时可能会出现错误。

所以地图加载时不再解析位图像素信息，而是直接取得位图的像素数组数据，这个工具就是把旧版本的位图地图转换成一个可用在javascript中的数组对象。

数组中的每个元素都是int值，由(r<<16)|(g<<8)|(b)算出。

////////////////////////////////////////////////////////
//Alistuff@ali
//
//基于.net framework4.0 c#
//源代码如下
////////////////////////////////////////////////////////

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;

namespace levelCreator
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--------------Bitmap To Txt------------------");
            while (true)
            {
                try
                {
                    Console.ResetColor();
                    Console.Write("Bitmap Path：");
                    var bitmapPath = Console.ReadLine();
                    Console.Write("Output Path：");
                    var outputPath = Console.ReadLine();
                    Console.Write("Level  Name：");
                    var levelName = Console.ReadLine();

                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("processing....");

                    var sw = new Stopwatch();
                    sw.Start();
                    var start = sw.ElapsedMilliseconds;

                    using (var image = new Bitmap(bitmapPath))
                    {
                        int[] colors = new int[image.Width * image.Height];
                        for (var y = 0; y < image.Height; y++)
                        {
                            for (var x = 0; x < image.Width; x++)
                            {
                                var color = image.GetPixel(x, y);
                                var colorHex = (color.R << 16) | (color.G << 8) | (color.B);
                                colors[y * image.Width + x] = colorHex;
                            }
                        }

                        var result = string.Join(",", colors);
                        var strb = new StringBuilder();
                        strb.Append(levelName);
                        strb.Append("=");
                        strb.Append("{");
                        strb.Append("width:" + image.Width+",");
                        strb.Append("height:" + image.Height + ",");
                        strb.Append("data:" + '[' + result + ']' + "");
                        strb.Append("}");
                        strb.Append(";");

                        using (var stream = new StreamWriter(outputPath))
                        {
                            stream.WriteLine(strb.ToString());
                        }

                       
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("Width：" + image.Width);
                        Console.WriteLine("Height：" + image.Height);
                    }

                    sw.Stop();   
                    Console.WriteLine("ElapsedMilliseconds：" + (sw.ElapsedMilliseconds - start)+"ms");
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Convert Succeed!");
                    Console.WriteLine();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                }
            }
        }
    }
}
