LevelCreator
����ת��λͼ��ͼ��javascript����

�ؿ���ͼ��λͼ����
ÿ�����ر�ʾ��ͬ�ĵ�����Ϣ

���ڲ�ͬ�������Ⱦλͼ������ɫ�����ƫ���ȡ����ÿ������ֵ��һ���Ǳ༭ʱ�趨�����أ������ڽ�����ͼʱ���ܻ���ִ���

���Ե�ͼ����ʱ���ٽ���λͼ������Ϣ������ֱ��ȡ��λͼ�������������ݣ�������߾��ǰѾɰ汾��λͼ��ͼת����һ��������javascript�е��������

�����е�ÿ��Ԫ�ض���intֵ����(r<<16)|(g<<8)|(b)�����

////////////////////////////////////////////////////////
//Alistuff@ali
//
//����.net framework4.0 c#
//Դ��������
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
                    Console.Write("Bitmap Path��");
                    var bitmapPath = Console.ReadLine();
                    Console.Write("Output Path��");
                    var outputPath = Console.ReadLine();
                    Console.Write("Level  Name��");
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
                        Console.WriteLine("Width��" + image.Width);
                        Console.WriteLine("Height��" + image.Height);
                    }

                    sw.Stop();   
                    Console.WriteLine("ElapsedMilliseconds��" + (sw.ElapsedMilliseconds - start)+"ms");
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
